"use client"
import React, { useEffect, useState } from 'react';
import { setCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import toast, { Toaster } from 'react-hot-toast';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { LogIn } from 'lucide-react'
import api from '@/lib/axios'

const formSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
}).required();
export default function page() {
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "demouser@gmail.com",
            password: "Pass@User",
        },
    });

    async function onSubmit(formState: z.infer<typeof formSchema>) {
        try {
            setIsButtonDisabled(true)
            const res = await api.post('api/v1/auth/login', formState);
            const { access_token, user } = res.data;
            setCookie('access_token', access_token, {
                maxAge: 60 * 60 * 24,
                path: '/',
            });
            localStorage.setItem('user', JSON.stringify(user));
            toast.success('You are authorized to access!');
            router.push('/');
        } catch (error) {
            toast.error('Login attempt failed!');
        } finally {
            setIsButtonDisabled(false);
        }
    }
    return (
        <div className='h-screen w-screen bg-gray-200 flex justify-center items-center'>
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Login to unlock infinite possibilities!</CardTitle>
                    <CardDescription>All your financial log in one place!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField

                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="enter email address" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password*</FormLabel>
                                        <FormControl>
                                            <Input placeholder="enter password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isButtonDisabled} className={`w-full ${isButtonDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}  mt-2`}> <LogIn /> login</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}


