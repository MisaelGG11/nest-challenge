import { registerAs } from '@nestjs/config';
import { validateEnv, type Environment } from './env.validation';

export default registerAs('env', (): Environment => validateEnv(process.env));
