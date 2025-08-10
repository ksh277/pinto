declare module 'next/server' {
  export class NextRequest { url: string; }
  export class NextResponse {
    static json(body: any, init?: { status?: number }): any;
  }
}
