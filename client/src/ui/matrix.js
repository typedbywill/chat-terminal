const { exec } = require("child_process");

function applyMatrixTheme() {
  exec("title MATRIX TERMINAL");
  exec("color 0a");
  exec("mode con: cols=120 lines=40");

  exec(`
powershell -command ^
  "$hwnd = (Get-Process -Id $PID).MainWindowHandle; ^
   Add-Type \\"using System; using System.Runtime.InteropServices; public class W { [DllImport(\\"user32.dll\\")] public static extern int SetWindowLong(IntPtr h, int n, int v); [DllImport(\\"user32.dll\\")] public static extern int GetWindowLong(IntPtr h, int n); [DllImport(\\"user32.dll\\")] public static extern bool SetLayeredWindowAttributes(IntPtr hwnd, uint crKey, byte bAlpha, uint dwFlags); }\\"; ^
   $GWL_EXSTYLE = -20; ^
   $WS_EX_LAYERED = 0x80000; ^
   $style = [W]::GetWindowLong($hwnd, $GWL_EXSTYLE) -bor $WS_EX_LAYERED; ^
   [W]::SetWindowLong($hwnd, $GWL_EXSTYLE, $style); ^
   [W]::SetLayeredWindowAttributes($hwnd, 0, 180, 2)"`);

  console.clear();
  console.log("\x1b[32m");
  console.log(`
███╗   ███╗ █████╗ ████████╗██████╗ ██╗██╗  ██╗
████╗ ████║██╔══██╗╚══██╔══╝██╔══██╗██║╚██╗██╔╝
██╔████╔██║███████║   ██║   ██████╔╝██║ ╚███╔╝ 
██║╚██╔╝██║██╔══██║   ██║   ██╔══██╗██║ ██╔██╗ 
██║ ╚═╝ ██║██║  ██║   ██║   ██║  ██║██║██╔╝ ██╗
╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝

           M A T R I X    O N L I N E
`);
  console.log("\nConectando...\n\x1b[0m");
}

module.exports = { applyMatrixTheme };
