import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true, unique: true, lowercase: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, enum: ['JOBSEEKER', 'EMPLOYER', 'ADMIN'] })
    role: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';

    @Prop()
    avatar?: string;

    @Prop()
    resume?: string;

    @Prop()
    companyName?: string;

    @Prop()
    companyDescription?: string;

    @Prop()
    companyLogo?: string;

    matchPassword?: (enteredPassword: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (
    enteredPassword: string,
): Promise<boolean> {
    return bcrypt.compare(enteredPassword, this.password);
};
