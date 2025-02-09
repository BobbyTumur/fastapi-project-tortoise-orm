/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ValidateImport } from './routes/validate'
import { Route as UploadImport } from './routes/upload'
import { Route as InvalidUrlImport } from './routes/invalid-url'
import { Route as ErrorImport } from './routes/error'
import { Route as DownloadImport } from './routes/download'

// Create/Update Routes

const ValidateRoute = ValidateImport.update({
  id: '/validate',
  path: '/validate',
  getParentRoute: () => rootRoute,
} as any)

const UploadRoute = UploadImport.update({
  id: '/upload',
  path: '/upload',
  getParentRoute: () => rootRoute,
} as any)

const InvalidUrlRoute = InvalidUrlImport.update({
  id: '/invalid-url',
  path: '/invalid-url',
  getParentRoute: () => rootRoute,
} as any)

const ErrorRoute = ErrorImport.update({
  id: '/error',
  path: '/error',
  getParentRoute: () => rootRoute,
} as any)

const DownloadRoute = DownloadImport.update({
  id: '/download',
  path: '/download',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/download': {
      id: '/download'
      path: '/download'
      fullPath: '/download'
      preLoaderRoute: typeof DownloadImport
      parentRoute: typeof rootRoute
    }
    '/error': {
      id: '/error'
      path: '/error'
      fullPath: '/error'
      preLoaderRoute: typeof ErrorImport
      parentRoute: typeof rootRoute
    }
    '/invalid-url': {
      id: '/invalid-url'
      path: '/invalid-url'
      fullPath: '/invalid-url'
      preLoaderRoute: typeof InvalidUrlImport
      parentRoute: typeof rootRoute
    }
    '/upload': {
      id: '/upload'
      path: '/upload'
      fullPath: '/upload'
      preLoaderRoute: typeof UploadImport
      parentRoute: typeof rootRoute
    }
    '/validate': {
      id: '/validate'
      path: '/validate'
      fullPath: '/validate'
      preLoaderRoute: typeof ValidateImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/download': typeof DownloadRoute
  '/error': typeof ErrorRoute
  '/invalid-url': typeof InvalidUrlRoute
  '/upload': typeof UploadRoute
  '/validate': typeof ValidateRoute
}

export interface FileRoutesByTo {
  '/download': typeof DownloadRoute
  '/error': typeof ErrorRoute
  '/invalid-url': typeof InvalidUrlRoute
  '/upload': typeof UploadRoute
  '/validate': typeof ValidateRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/download': typeof DownloadRoute
  '/error': typeof ErrorRoute
  '/invalid-url': typeof InvalidUrlRoute
  '/upload': typeof UploadRoute
  '/validate': typeof ValidateRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/download' | '/error' | '/invalid-url' | '/upload' | '/validate'
  fileRoutesByTo: FileRoutesByTo
  to: '/download' | '/error' | '/invalid-url' | '/upload' | '/validate'
  id:
    | '__root__'
    | '/download'
    | '/error'
    | '/invalid-url'
    | '/upload'
    | '/validate'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  DownloadRoute: typeof DownloadRoute
  ErrorRoute: typeof ErrorRoute
  InvalidUrlRoute: typeof InvalidUrlRoute
  UploadRoute: typeof UploadRoute
  ValidateRoute: typeof ValidateRoute
}

const rootRouteChildren: RootRouteChildren = {
  DownloadRoute: DownloadRoute,
  ErrorRoute: ErrorRoute,
  InvalidUrlRoute: InvalidUrlRoute,
  UploadRoute: UploadRoute,
  ValidateRoute: ValidateRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/download",
        "/error",
        "/invalid-url",
        "/upload",
        "/validate"
      ]
    },
    "/download": {
      "filePath": "download.tsx"
    },
    "/error": {
      "filePath": "error.tsx"
    },
    "/invalid-url": {
      "filePath": "invalid-url.tsx"
    },
    "/upload": {
      "filePath": "upload.tsx"
    },
    "/validate": {
      "filePath": "validate.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
