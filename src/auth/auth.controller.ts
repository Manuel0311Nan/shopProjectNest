import { RawHeaders } from './decorator/raw-headers.decorator';
import { LoginUserDto } from './dto/login-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Headers, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { GetUser } from './decorator/get_user.decorator';
import { IncomingHttpHeaders } from 'http';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorator/role-protected.decorator';
import { ValidRoles } from './interfaces/valid.roles.interface';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }
  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser(['email']) userMail: string,
    
    @RawHeaders() rawHeaders: string[],
    @Headers() headers: IncomingHttpHeaders
  ) {
    return {
      ok: true,
      message: 'Hola Mundo Private',
      user,
      userMail,
      rawHeaders,
      headers
    }
  }

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.user, ValidRoles.admin)
  @UseGuards( AuthGuard(), UserRoleGuard)
  privateRoute2( @GetUser() user: User) {

    return {
      ok: true,
      user
    }
  }

}
