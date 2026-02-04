import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Role } from 'src/common/enums/role';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;

  @ApiProperty({
    example: 'John Doe',
    description: 'Provide Username',
    required: true,
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    example: 'johndoe@gmail.com',
    description: 'Provide the email of the User',
    required: true,
  })
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @ApiProperty({
    example: '******',
    description: 'Provide the password of the User',
    required: true,
  })
  @Prop({
    required: true,
  })
  password: string;

  @ApiProperty({
    example: 'JOBSEEKER|EMPLOYER',
    description: 'Provide the role of the User',
    required: true,
  })
  @Prop({ required: true, enum: Role, default: Role.JOBSEEKER })
  role: Role;

  @ApiProperty({
    description: "Refresh token",
    required: false
  })
  refreshToken?: string

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailOtp?: string;

  @Prop()
  emailOtpExpiresAt?: Date;

  @ApiProperty({
    example: 'janedone.jpg',
    description: 'Provide the avatar of the User',
  })
  @Prop()
  avatar?: string;

  @ApiProperty({
    example: 'janedone.jpg',
    description: 'Provide the resume of the User',
  })
  @Prop()
  resume?: string;

  @ApiProperty({
    example: 'Company Name Pvt. Ltd',
    description: 'Provide the name of the company',
  })
  @Prop()
  companyName?: string;

  @ApiProperty({
    example: 'Company Description',
    description: 'Provide the Description of the company',
  })
  @Prop()
  companyDescription?: string;

  @ApiProperty({
    example: 'companylogo.jpg',
    description: 'Provide the logo of the Company',
  })
  @Prop()
  companyLogo?: string;

  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// UserSchema.pre<UserDocument>('save', async function () {
//     if (!this.isModified('password')) return;

//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });

// UserSchema.methods.matchPassword = async function (
//     enteredPassword: string,
// ): Promise<boolean> {
//     return bcrypt.compare(enteredPassword, this.password);
// };
