import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function isProtectedPath(pathname: string) {
  return (
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/termos' ||
    pathname.startsWith('/termos/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/usuarios' ||
    pathname.startsWith('/usuarios/') ||
    pathname === '/auditoria' ||
    pathname.startsWith('/auditoria/') ||
    pathname === '/conta' ||
    pathname.startsWith('/conta/')
  )
}

function isLoginPath(pathname: string) {
  return pathname === '/login'
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthenticated = !!user
  let isActive = true

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.is_active === false) {
      isActive = false
    }
  }

  const { pathname, search } = request.nextUrl

  if ((!isAuthenticated || !isActive) && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', `${pathname}${search}`)

    if (isAuthenticated && !isActive) {
      url.searchParams.set('error', 'inactive')
    }

    return NextResponse.redirect(url)
  }

  if (isAuthenticated && isActive && isLoginPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}
