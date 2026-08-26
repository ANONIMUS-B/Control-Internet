import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import { Mail, Lock, User } from 'lucide-react';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    return (
        <>
            <Head title="Registrarse" />

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-neutral-700 dark:text-neutral-300">
                                    Nombre completo
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nombre completo"
                                        className="pl-10 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-800/50"
                                    />
                                </div>
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-neutral-700 dark:text-neutral-300">
                                    Correo electrónico
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="ejemplo@ugelambo.gob.pe"
                                        className="pl-10 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-800/50"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-neutral-700 dark:text-neutral-300">
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="••••••••"
                                        passwordrules={passwordRules}
                                        className="pl-10 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-800/50"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-neutral-700 dark:text-neutral-300">
                                    Confirmar contraseña
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="••••••••"
                                        passwordrules={passwordRules}
                                        className="pl-10 border-purple-200/50 focus:border-purple-500 focus:ring-purple-500/20 dark:border-purple-800/50"
                                    />
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-medium rounded-xl py-2.5 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Crear cuenta
                            </Button>
                        </div>

                        <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
                            ¿Ya tienes una cuenta?{' '}
                            <TextLink href={login()} tabIndex={6} className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                                Iniciar Sesión
                            </TextLink>
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
        </>
    );
}

Register.layout = {
    title: 'Crear una cuenta',
    description: 'Ingresa tus datos para crear tu cuenta',
};