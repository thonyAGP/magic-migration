import type { TicketData } from './types';
import { encodeTicket } from './escposEncoder';

// WebUSB/WebSerial type declarations
declare global {
  interface Navigator {
    usb?: USB;
    serial?: Serial;
  }
}

interface USB {
  requestDevice(options: USBRequestDeviceOptions): Promise<USBDevice>;
}

interface USBRequestDeviceOptions {
  filters: Array<{ vendorId?: number; productId?: number }>;
}

interface USBDevice {
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  transferOut(endpointNumber: number, data: Uint8Array | ArrayBuffer): Promise<USBTransferOutResult>;
  configuration?: USBConfiguration;
}

interface USBConfiguration {
  interfaces: USBInterface[];
}

interface USBInterface {
  alternate: USBAlternateInterface;
}

interface USBAlternateInterface {
  endpoints: USBEndpoint[];
}

interface USBEndpoint {
  endpointNumber: number;
  direction: 'in' | 'out';
}

interface USBTransferOutResult {
  bytesWritten: number;
  status: 'ok' | 'stall' | 'babble';
}

interface Serial {
  requestPort(): Promise<SerialPort>;
}

interface SerialPort {
  open(options: SerialOptions): Promise<void>;
  close(): Promise<void>;
  writable?: WritableStream<Uint8Array>;
}

interface SerialOptions {
  baudRate: number;
}

export interface EscPosPrinter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  print(ticket: TicketData): Promise<void>;
  cut(): Promise<void>;
  isConnected(): boolean;
}

interface UsbConnection {
  type: 'usb';
  device: USBDevice;
}

interface SerialConnection {
  type: 'serial';
  port: SerialPort;
}

type PrinterConnection = UsbConnection | SerialConnection | null;

export function createEscPosPrinter(): EscPosPrinter {
  let connection: PrinterConnection = null;

  async function sendData(data: Uint8Array): Promise<void> {
    if (!connection) throw new Error('Imprimante non connectee');

    if (connection.type === 'usb') {
      const ep = connection.device.configuration?.interfaces[0]?.alternate.endpoints
        .find((e: USBEndpoint) => e.direction === 'out');
      if (!ep) throw new Error('Endpoint USB non trouve');
      await connection.device.transferOut(ep.endpointNumber, data);
    } else {
      const writer = connection.port.writable?.getWriter();
      if (!writer) throw new Error('Port serie non disponible');
      try {
        await writer.write(data);
      } finally {
        writer.releaseLock();
      }
    }
  }

  return {
    async connect() {
      // Try WebUSB first (Epson vendor ID)
      if (navigator.usb) {
        try {
          const device = await navigator.usb.requestDevice({
            filters: [{ vendorId: 0x04b8 }],
          });
          await device.open();
          await device.selectConfiguration(1);
          await device.claimInterface(0);
          connection = { type: 'usb', device };
          return;
        } catch (_err: unknown) {
          /* WebUSB not available or denied, try serial */
        }
      }

      // Fallback to WebSerial
      if (navigator.serial) {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        connection = { type: 'serial', port };
        return;
      }

      throw new Error('Aucune imprimante thermique detectee');
    },

    async disconnect() {
      if (!connection) return;
      if (connection.type === 'usb') {
        await connection.device.close();
      } else {
        await connection.port.close();
      }
      connection = null;
    },

    async print(ticket: TicketData) {
      const encoded = encodeTicket(ticket);
      await sendData(encoded);
    },

    async cut() {
      const { encodeCut } = await import('./escposEncoder');
      await sendData(encodeCut());
    },

    isConnected() {
      return connection !== null;
    },
  };
}
