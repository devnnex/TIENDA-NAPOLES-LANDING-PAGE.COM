# Tienda Nápoles · Landing de descarga

Página estática en HTML, CSS y JavaScript. Los botones de Windows consultan la
última versión publicada del repositorio offline y descargan directamente su
instalador `.exe`; no abren la página del repositorio. La versión y el tamaño
mostrados también se obtienen de esa publicación.

Para publicar una versión nueva, sube el instalador como archivo de una nueva
release estable del repositorio offline. El archivo debe llamarse
`Tienda-Napoles-Offline-Setup-X.Y.Z.exe`. La landing lo detectará sin cambiar
sus enlaces. Si GitHub no permite verificar la última release, la descarga se
detiene con un mensaje visible en vez de entregar un instalador anterior.

El instalador actual no tiene firma digital. Por eso la página advierte que
Windows puede mostrar una alerta de seguridad durante la instalación.
