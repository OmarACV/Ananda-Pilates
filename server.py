#!/usr/bin/env python3
import http.server
import socketserver
import socket

def get_local_ip():
    try:
        # Conectar a un servidor externo para obtener la IP local
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == "__main__":
    local_ip = get_local_ip()
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print("🎄 SERVIDOR ANANDA PILATES ACTIVO 🎄")
        print("=" * 60)
        print(f"📱 Acceso local: http://localhost:{PORT}")
        print(f"🌐 Acceso desde otras PCs: http://{local_ip}:{PORT}")
        print("=" * 60)
        print("📋 Páginas disponibles:")
        print(f"   • Página principal: http://{local_ip}:{PORT}/index.html")
        print(f"   • Registro/Login: http://{local_ip}:{PORT}/auth.html")
        print(f"   • Panel Admin: http://{local_ip}:{PORT}/admin.html")
        print("=" * 60)
        print("⚠️  Para acceder desde otra PC:")
        print("   1. Asegúrate de estar en la misma red WiFi")
        print("   2. Desactiva el firewall temporalmente si es necesario")
        print("   3. Usa la IP mostrada arriba")
        print("=" * 60)
        print("🛑 Presiona Ctrl+C para detener el servidor")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor detenido")
            httpd.shutdown()