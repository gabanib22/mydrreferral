import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // console.log("Here", request.headers);
  request.headers.set("Accept-CH", 'Viewport-Width');
  // return NextResponse.redirect(new URL('/login', request.url));
}