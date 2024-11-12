import { User, UserSchema } from './schemas/user.schema';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FilesModule } from 'src/files/files.module';
import { Role, RoleSchema } from 'src/roles/schemas/role.schema';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }]),
    FilesModule,
    MailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService, MongooseModule]
})
export class UsersModule { }
