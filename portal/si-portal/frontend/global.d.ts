declare module "*.scss" {
  const styles: { [key: string]: string };
  export default styles;
}

declare module "html-docx-js/dist/html-docx" {
  const htmlDocx: any;
  export default htmlDocx;
}
