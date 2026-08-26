import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Wifi, Mail, Lock } from 'lucide-react';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Iniciar Sesión" />

            {/* ✅ YA NO ES NECESARIO EL LOGO AQUÍ PORQUE ESTÁ EN EL LAYOUT */}
            {/* El logo, título y descripción ahora vienen del layout AuthSimpleLayout */}

            <PasskeyVerify />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="ejemplo@ugelambo.gob.pe"
                                        className="pl-10 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-800/50"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">
                                        Contraseña
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                            tabIndex={5}
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        className="pl-10 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-800/50"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                />
                                <Label htmlFor="remember" className="text-sm text-neutral-600 dark:text-neutral-400">
                                    Recordarme
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-medium rounded-xl py-2.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Iniciar Sesión
                            </Button>
                        </div>

                        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                            ¿No tienes una cuenta?{' '}
                            - Comunicate con 925523419
                            {/* <TextLink href={register()} tabIndex={5} className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                                Regístrate
                            </TextLink> */}
                        </div>

                        {/* Footer */}
                        <div className="mt-2 pt-4 border-t border-purple-200/30 dark:border-purple-800/30">
                            <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
                                UGEL Ambo · Sistema de Conformidad de Internet
                            </p>
                            <p className="text-center text-[10px] text-neutral-400/60 dark:text-neutral-500/60 mt-0.5">
                                v1.0 · {new Date().getFullYear()}
                            </p>
                        </div>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Conformidad de Internet',
    description: 'Inicia sesión para gestionar tus reportes',
};