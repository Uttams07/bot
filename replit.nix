
{ pkgs }: {
    deps = [
        pkgs.nodejs-20_x
        pkgs.libuuid
        pkgs.pkg-config
        pkgs.cairo
        pkgs.pango
        pkgs.libpng
        pkgs.libjpeg
        pkgs.giflib
        pkgs.librsvg
        pkgs.pixman
    ];
}
