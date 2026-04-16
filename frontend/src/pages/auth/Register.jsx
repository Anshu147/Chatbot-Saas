import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
// import { register, clearError } from '../../store/slices/authSlice.js';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { register, clearError } from '../../store/slices/authSlice';

const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
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
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validate = () => {
        const errors = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
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

        const { name, email, password } = formData;
        dispatch(register({ name, email, password }));
    };

    const steps = [
        {
            number: '01',
            icon: '✍️',
            title: 'Create Your Account',
            description: 'Sign up with your name, email, and a secure password — takes less than a minute.',
        },
        {
            number: '02',
            icon: '🤖',
            title: 'Build Your Chatbot',
            description: 'Configure your AI chatbot, upload documents, and customise its personality for your brand.',
        },
        {
            number: '03',
            icon: '🌐',
            title: 'Embed & Go Live',
            description: 'Copy a single script tag, paste it on your website, and start chatting with visitors.',
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
                                Quick Onboarding
                            </span>
                            <h3 className="mt-3 text-xl font-bold text-gray-900">Up and running in 3 steps</h3>
                            <p className="mt-1 text-sm text-gray-500">Create an account and deploy AI chatbots on your website in minutes.</p>
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

                        {/* <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-yellow-400 text-sm">★★★★★</span>
                                <span className="text-xs font-semibold text-gray-700">4.9 / 5</span>
                            </div>
                            <p className="text-xs text-gray-500">"Set up my chatbot in under 10 minutes. Absolutely seamless experience!"</p>
                            <p className="text-xs text-gray-400 mt-1">— Sarah K., Product Manager</p>
                        </div> */}
                    </div>
                </div>

                {/* Form */}
                <div className="w-full lg:max-w-md space-y-8">
                    <div>
                        <h2 className="text-center text-3xl font-extrabold text-gray-900">
                            Create your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Or{' '}
                            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                                sign in to your existing account
                            </Link>
                        </p>
                    </div>

                    <form className="space-y-6 card" onSubmit={handleSubmit}>
                        {error && <Alert type="error" message={error} onClose={() => dispatch(clearError())} />}

                        <Input
                            label="Full Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            error={formErrors.name}
                            required
                        />

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

                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            error={formErrors.confirmPassword}
                            required
                        />

                        <Button type="submit" loading={loading} fullWidth>
                            Create Account
                        </Button>

                        <p className="text-xs text-center text-gray-500 mt-4">
                            By creating an account, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Register;