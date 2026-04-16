import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../../store/slices/authSlice';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validate = () => {
        const errors = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        dispatch(login(formData));
    };

    const steps = [
        {
            number: '01',
            icon: '🔑',
            title: 'Sign In',
            description: 'Log in with your email and password to access your chatbot dashboard.',
        },
        {
            number: '02',
            icon: '🤖',
            title: 'Manage Chatbots',
            description: 'Create, configure, and train AI chatbots tailored to your business needs.',
        },
        {
            number: '03',
            icon: '🚀',
            title: 'Go Live',
            description: 'Embed the widget on your website and start engaging visitors instantly.',
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-10 items-start lg:items-center justify-center">

                {/* Steps Card */}
                <div className="w-full lg:w-[420px] shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                        <div className="mb-6">
                            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                                How it works
                            </span>
                            <h3 className="mt-3 text-xl font-bold text-gray-900">Get started in 3 easy steps</h3>
                            <p className="mt-1 text-sm text-gray-500">Sign in and you're ready to deploy AI chatbots in minutes.</p>
                        </div>

                        <div className="space-y-6">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className="flex flex-col items-center">
                                        <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center text-xl shadow-sm shrink-0">
                                            {step.icon}
                                        </div>
                                        {idx < steps.length - 1 && (
                                            <div className="w-px flex-1 mt-2 bg-gradient-to-b from-primary-200 to-transparent min-h-[28px]" />
                                        )}
                                    </div>
                                    <div className="pt-1 pb-2">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[10px] font-bold text-primary-400 tracking-widest">STEP {step.number}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800">{step.title}</p>
                                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-3">
                            <div className="flex -space-x-2">
                                {['bg-blue-400','bg-violet-400','bg-emerald-400'].map((c, i) => (
                                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white`} />
                                ))}
                            </div>
                            <p className="text-xs text-gray-500"><span className="font-semibold text-gray-700">500+</span> businesses already using the platform</p>
                        </div> */}
                    </div>
                </div>

                {/* Form */}
                <div className="w-full lg:max-w-md space-y-8">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-gray-900">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                                create a new account
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-6 card" onSubmit={handleSubmit}>
                        {error && <Alert type="error" message={error} onClose={() => dispatch(clearError())} />}

                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            error={formErrors.email}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            error={formErrors.password}
                            required
                        />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <Button type="submit" loading={loading} fullWidth>
                            Sign In
                        </Button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Login;