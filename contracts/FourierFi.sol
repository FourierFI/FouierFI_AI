// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FourierFi Token
 * @dev Implementation of the FourierFi governance token
 */
contract FFToken is ERC20, Ownable {
    constructor() ERC20("FourierFi", "FF") Ownable(msg.sender) {
        _mint(msg.sender, 100000000 * 10**decimals()); // 100M tokens
    }
}

/**
 * @title Strategy NFT
 * @dev NFT representing trading strategies
 */
contract StrategyNFT is ERC721, Ownable {
    struct Strategy {
        string name;
        string description;
        address creator;
        uint256 performanceFee; // in basis points (1/100 of 1%)
        bool active;
    }

    mapping(uint256 => Strategy) public strategies;
    uint256 private _nextTokenId;

    constructor() ERC721("FourierFi Strategy", "FFS") Ownable(msg.sender) {}

    function createStrategy(
        string memory name,
        string memory description,
        uint256 performanceFee
    ) external returns (uint256) {
        require(performanceFee <= 5000, "Fee too high"); // Max 50%

        uint256 tokenId = _nextTokenId++;
        strategies[tokenId] = Strategy({
            name: name,
            description: description,
            creator: msg.sender,
            performanceFee: performanceFee,
            active: true
        });

        _mint(msg.sender, tokenId);
        return tokenId;
    }
}

/**
 * @title Harmonic Pool
 * @dev Liquidity pool with dynamic fee structure
 */
contract HarmonicPool is ReentrancyGuard, Ownable {
    struct PoolInfo {
        address token0;
        address token1;
        uint256 reserve0;
        uint256 reserve1;
        uint256 totalShares;
        uint256 baseFee; // in basis points
        uint256 dynamicFee; // additional fee based on volatility
    }

    mapping(bytes32 => PoolInfo) public pools;
    mapping(bytes32 => mapping(address => uint256)) public userShares;

    event PoolCreated(address token0, address token1);
    event LiquidityAdded(address user, uint256 amount0, uint256 amount1);
    event LiquidityRemoved(address user, uint256 amount0, uint256 amount1);

    constructor() Ownable(msg.sender) {}

    function createPool(address token0, address token1) external {
        require(token0 < token1, "Invalid token order");
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        require(pools[poolId].token0 == address(0), "Pool exists");

        pools[poolId] = PoolInfo({
            token0: token0,
            token1: token1,
            reserve0: 0,
            reserve1: 0,
            totalShares: 0,
            baseFee: 30, // 0.3%
            dynamicFee: 0
        });

        emit PoolCreated(token0, token1);
    }

    function addLiquidity(
        address token0,
        address token1,
        uint256 amount0,
        uint256 amount1
    ) external nonReentrant {
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        PoolInfo storage pool = pools[poolId];
        require(pool.token0 != address(0), "Pool not found");

        // Transfer tokens
        ERC20(token0).transferFrom(msg.sender, address(this), amount0);
        ERC20(token1).transferFrom(msg.sender, address(this), amount1);

        // Calculate shares
        uint256 shares;
        if (pool.totalShares == 0) {
            shares = amount0; // Initial shares based on token0
        } else {
            shares = (amount0 * pool.totalShares) / pool.reserve0;
        }

        // Update pool
        pool.reserve0 += amount0;
        pool.reserve1 += amount1;
        pool.totalShares += shares;
        userShares[poolId][msg.sender] += shares;

        emit LiquidityAdded(msg.sender, amount0, amount1);
    }

    function removeLiquidity(
        address token0,
        address token1,
        uint256 shares
    ) external nonReentrant {
        bytes32 poolId = keccak256(abi.encodePacked(token0, token1));
        PoolInfo storage pool = pools[poolId];
        require(userShares[poolId][msg.sender] >= shares, "Insufficient shares");

        // Calculate amounts
        uint256 amount0 = (shares * pool.reserve0) / pool.totalShares;
        uint256 amount1 = (shares * pool.reserve1) / pool.totalShares;

        // Update pool
        pool.reserve0 -= amount0;
        pool.reserve1 -= amount1;
        pool.totalShares -= shares;
        userShares[poolId][msg.sender] -= shares;

        // Transfer tokens
        ERC20(token0).transfer(msg.sender, amount0);
        ERC20(token1).transfer(msg.sender, amount1);

        emit LiquidityRemoved(msg.sender, amount0, amount1);
    }

    function updateDynamicFee(bytes32 poolId, uint256 newDynamicFee) external onlyOwner {
        require(newDynamicFee <= 100, "Fee too high"); // Max 1%
        pools[poolId].dynamicFee = newDynamicFee;
    }
}

/**
 * @title FourierFi Protocol
 * @dev Main contract coordinating the FourierFi protocol
 */
contract FourierFi is Ownable {
    FFToken public immutable ffToken;
    StrategyNFT public immutable strategyNFT;
    HarmonicPool public immutable harmonicPool;

    // Staking
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public stakingTimestamp;
    uint256 public constant MINIMUM_STAKING_PERIOD = 7 days;
    uint256 public constant STAKING_APY = 1000; // 10%

    // Strategy performance tracking
    mapping(uint256 => uint256) public strategyPerformance; // strategy ID => performance score

    event Staked(address user, uint256 amount);
    event Unstaked(address user, uint256 amount);
    event RewardsClaimed(address user, uint256 amount);

    constructor() Ownable(msg.sender) {
        ffToken = new FFToken();
        strategyNFT = new StrategyNFT();
        harmonicPool = new HarmonicPool();
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be positive");
        ffToken.transferFrom(msg.sender, address(this), amount);
        
        stakedAmount[msg.sender] += amount;
        stakingTimestamp[msg.sender] = block.timestamp;
        
        emit Staked(msg.sender, amount);
    }

    function unstake() external {
        uint256 amount = stakedAmount[msg.sender];
        require(amount > 0, "No staked tokens");
        require(
            block.timestamp >= stakingTimestamp[msg.sender] + MINIMUM_STAKING_PERIOD,
            "Staking period not met"
        );

        uint256 rewards = calculateRewards(msg.sender);
        stakedAmount[msg.sender] = 0;

        ffToken.transfer(msg.sender, amount + rewards);
        
        emit Unstaked(msg.sender, amount);
        if (rewards > 0) {
            emit RewardsClaimed(msg.sender, rewards);
        }
    }

    function calculateRewards(address user) public view returns (uint256) {
        if (stakedAmount[user] == 0) return 0;

        uint256 stakingDuration = block.timestamp - stakingTimestamp[user];
        return (stakedAmount[user] * stakingDuration * STAKING_APY) / (365 days * 10000);
    }

    function updateStrategyPerformance(uint256 strategyId, uint256 performance) external onlyOwner {
        strategyPerformance[strategyId] = performance;
    }
} 