import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({ message: 'name khong duoc de trong' })
    name: string;

    @IsNotEmpty({ message: 'apiPath khong duoc de trong' })
    apiPath: string;

    @IsNotEmpty({ message: 'method khong duoc de trong' })
    method: string;

    @IsNotEmpty({ message: 'module khong duoc de trong' })
    module: string;

    isDeleted:string
}
