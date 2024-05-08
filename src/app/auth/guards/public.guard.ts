import { inject } from "@angular/core";
import { Observable, map, tap } from "rxjs";
import { ActivatedRouteSnapshot, CanActivateFn, CanMatchFn, Route, Router, RouterStateSnapshot, UrlSegment } from "@angular/router";

import { AuthService } from "../services/auth.services";

const checkAuthStatus = (): boolean | Observable<boolean> => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.checkAuthentication().pipe(
    tap( isAuthenticated => console.log({ isAuthenticated }) ),
    tap( isAuthenticated => {
      if (isAuthenticated) {
        router.navigate(['./']);
      }
    }),
    map( isAuthenticated => !isAuthenticated )
  );
};

export const publicCanActivateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  console.log('CanActivate');
  console.log({ route, state });

  return checkAuthStatus();
};

export const publicCanMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => {
  console.log('CanMatch');
  console.log({ route, segments });

  return checkAuthStatus();
};
