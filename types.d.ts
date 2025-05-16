// @chatwing
// This allows TypeScript to understand what Vite will do when non-code
// assets are imported.
declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.json" {
  const value: any;
  export default value;
}
