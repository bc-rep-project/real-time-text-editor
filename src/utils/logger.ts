type LogLevel = 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const timestamp = this.getTimestamp();
    console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
  }

  public info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      this.log('debug', message, ...args);
    }
  }
}

export const logger = new Logger(); 