import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MailService } from '../../../modules/mail/services';
import { UserDto } from '../../master_user/dtos';
import { UserService } from '../../master_user/services';
import { UserLoginDto, UserRegistrationDto } from '../dtos';
import { LoginSuccessDto } from '../dtos/login-sucess.dto';
import {
  LocalAuthenticationGuard,
  JwtRefreshTokenGuard,
  EmailConfirmationGuard,
  JwtAccessTokenGuard,
  JwtConfirmTokenGuard,
} from '../guards';
import { RequestWithUserInterface } from '../interfaces';
import { AuthService } from '../services';

import { UserMailSalesDto } from '../dtos/user-mail-sales.dto';
import * as SendGrid from '@sendgrid/mail';
import {
  ResponseCode,
  responseKey,
  ResponseName,
} from '../../../common/constants/response.constant';
import { SuccessResponse } from '../../../common/dtos/http-response.dto';
import { UserUpdateDto } from '../dtos/user-update.dto';
@Controller({ path: 'Auth', version: '1' })
@ApiTags('Auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _userService: UserService,
    private readonly _mailService: MailService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Successfully Registered',
    status: HttpStatus.OK,
    type: SuccessResponse,
  })
  @ApiOperation({ summary: 'Allows new users registration' })
  async register(
    @Body() userRegistrationDto: UserRegistrationDto,
    @Res() res,
  ): Promise<any> {
    await this._authService.register(userRegistrationDto);
    res
      .status(HttpStatus.OK)
      .json({
        [responseKey.STATUS]: ResponseCode.SUCCESS_CODE,
        [responseKey.MESSAGE]: ResponseName.SUCCESS,
      })
      .send();
  }

  @UseGuards(LocalAuthenticationGuard)
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'An user logged in and a session cookie',
    status: HttpStatus.OK,
    type: LoginSuccessDto,
  })
  @ApiOperation({ summary: 'Starts a new user session' })
  async login(
    @Req() req: RequestWithUserInterface,
    @Body() userLogin: UserLoginDto,
    @Res() res,
  ): Promise<void> {
    const [accessTokenCookie, refreshTokenCookie] =
      await this._authService.login(userLogin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.set('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    res.send({
      success: 'true',
    });
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get current user profile',
    type: UserDto,
  })
  @ApiOperation({ summary: 'Get current user profile' })
  async userProfile(
    @Req() { user }: RequestWithUserInterface,
  ): Promise<UserDto> {
    const userEntity = await this._userService.getUser(user.uuid);

    return userEntity.toDto();
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('updateprofile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'An user logged in and a session cookie',
    status: HttpStatus.OK,
    type: LoginSuccessDto,
  })
  @ApiOperation({ summary: 'Starts a new user session' })
  async updateProfile(
    @Req() req: RequestWithUserInterface,
    @Body() userUpdate: UserUpdateDto,
    @Res() res,
  ): Promise<void> {
    const userUpdateResponse = await this._userService.updateUser(userUpdate);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.send({
      success: 'true',
    });
  }

  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('signout')
  @ApiOperation({ summary: 'Delete current user session' })
  async logout(@Req() request: RequestWithUserInterface): Promise<void> {
    await this._authService.logout(request.user);

    request.res.setHeader(
      'Set-Cookie',
      this._authService.getCookiesForLogout(),
    );
  }

  @UseGuards(JwtRefreshTokenGuard)
  @Get('refresh')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information with a new access token',
    type: UserDto,
  })
  @ApiOperation({ summary: 'Refresh current user access token' })
  async refresh(@Req() request: RequestWithUserInterface): Promise<void> {
    const accessTokenCookie = this._authService.refreshToken(request.user);

    request.res.setHeader('Set-Cookie', accessTokenCookie);
  }

  @UseGuards(JwtConfirmTokenGuard)
  @Patch('confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Finish the confirmation email process for current user',
  })
  async confirm(@Req() { user }: RequestWithUserInterface): Promise<void> {
    console.log(this.userProfile);

    return this._authService.confirm(user);
  }

  @UseGuards(JwtAccessTokenGuard)
  @Post('confirm/resend')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Resend the confirmation link for current user',
  })
  async resendConfirmationLink(
    @Req() { user }: RequestWithUserInterface,
  ): Promise<void> {
    await this._authService.resendConfirmationLink(user);
  }

  @Post('sendmailsales')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Successfully sent',
    status: HttpStatus.OK,
  })
  @ApiOperation({ summary: 'Allows new users registration' })
  async sendMailSales(
    @Body() userMailDto: UserMailSalesDto,
  ): Promise<SendGrid.ClientResponse> {
    const mailSales = {
      to: 'josemiguelaparicio507@gmail.com',
      subject: 'New user waiting product',
      from: 'smallbuznoreply@gmail.com',
      text: `There's a new email coming from: User: ${userMailDto.name}, email: ${userMailDto.email} looking for your product`,
      html: `<h1>There's a new email coming from: ${userMailDto.email} looking for your product with this text:${userMailDto.message} </h1> `,
    };
    const mailCustomer = {
      to: userMailDto.email,
      subject: 'Thanks for choosing us!',
      from: 'smallbuznoreply@gmail.com',
      text: `In a couple of days, we'll be in contact with you`,
      html: `<p>In a couple of days, we'll be in contact with you</p> `,
    };
    const [result] = await this._mailService.sendMail(mailSales, mailCustomer);
    return result;
  }
}
