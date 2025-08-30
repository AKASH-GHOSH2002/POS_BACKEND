import { IsUUID, IsArray } from 'class-validator';

export class AssignCategoriesToModelDto {
  @IsUUID()
  modelId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
