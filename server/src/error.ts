export class ClientError extends Error {
    code: string

    constructor(code: string, message: string) {
        super(message);
        this.code = code
        this.name = "ClientError";
    }
}
