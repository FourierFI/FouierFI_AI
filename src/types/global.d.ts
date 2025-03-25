import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (eventName: string, handler: (args: any) => void) => void;
      removeListener: (eventName: string, handler: (args: any) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      address?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    address?: string;
  }
}

declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE_URL?: string;
      NEXT_PUBLIC_WS_URL?: string;
      NEXT_PUBLIC_API_KEY?: string;
    }
  }
}

export {}; 