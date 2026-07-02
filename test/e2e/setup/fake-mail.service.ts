

export class FakeMailService {
    async sendVerificationOtp() {
        return true;
    }

    async sendForgotPasswordOtp() {
        return true;
    }

    async sendMail() {
        return true;
    }
}