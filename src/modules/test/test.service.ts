import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class TestService {

    // Helper to pick a random value from an array
    private getRandomValue<T>(arr: T[]): T {
        const index = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    // Simulate a heavy task
    private async doSomeHeavyTask(): Promise<number> {
        const ms = this.getRandomValue([100, 150, 200, 300, 600, 500, 1000, 1400, 2500]);
        const shouldThrowError = this.getRandomValue([1, 2, 3, 4, 5, 6, 7, 8]) === 8;

        if (shouldThrowError) {
            const randomError = this.getRandomValue([
                "DB Payment Failure",
                "DB Server is Down",
                "Access Denied",
                "Not Found Error",
            ]);
            throw new InternalServerErrorException(randomError);
        }

        // Simulate async work
        return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
    }

    // Public method to call heavy task
    async slow(): Promise<{ status: string; message: string }> {
        try {
            const timeTaken = await this.doSomeHeavyTask();
            return {
                status: 'Success',
                message: `Task completed in ${timeTaken} ms`,
            };
        } catch (error: any) {
            throw error;
        }
    }

    // Example of a fast task
    async fast(): Promise<{ status: string; message: string }> {
        return {
            status: 'Success',
            message: 'Fast task completed instantly',
        };
    }
}
