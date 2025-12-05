declare module "*.png";
declare module "*.jpg";
declare module "*.svg";

declare module "*&as=srcset" {
    const out: string;
    export default out;
}
