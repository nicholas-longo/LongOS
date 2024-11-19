var TSOS;
(function (TSOS) {
    // Extends DeviceDriver
    class DiskSystemDeviceDriver extends TSOS.DeviceDriver {
        constructor() {
            super();
            this.driverEntry = this.krnDiskDriverEntry;
        }
        krnDiskDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }
    }
    TSOS.DiskSystemDeviceDriver = DiskSystemDeviceDriver;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=diskSystemDeviceDriver.js.map