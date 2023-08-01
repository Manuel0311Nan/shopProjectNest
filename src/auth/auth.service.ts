import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';


@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository:Repository <User>
  ) { }
  

  //----------------------------------------------------------------------------------------//
  async create(createUserDto: CreateUserDto) {

    try {
      const {password, ...userData} = createUserDto
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })
      await this.userRepository.save(user)
      return user
    } catch (error) {
      this.handleDBErrors(error)
    }
  }
  //---------------------------------------------------------------------------------------//

  async login(loginUserDto: LoginUserDto) {

    const { password, email } = loginUserDto
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: {email: true, password: true}
    })
    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)')
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid (password)')
    return user
  }

  //-------------------------------------------------------------------------------------//

  private handleDBErrors(error: any): never {
    if (error.code === '23505') 
      throw new BadRequestException(error.detail);
    
      console.log(error)
      throw new InternalServerErrorException('Please check server logs')
    
  }

}
