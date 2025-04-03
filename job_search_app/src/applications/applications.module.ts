import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Application, ApplicationSchema } from './schemas/application.schema';
import { FilesModule } from 'src/files/files.module';
import { Notification, NotificationSchema } from 'src/notifications/schemas/notification.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Application.name, schema: ApplicationSchema }]), FilesModule,
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]), FilesModule,
    NotificationsModule,

  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService]
})
export class ApplicationsModule { }
