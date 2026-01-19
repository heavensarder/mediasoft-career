'use client';

import { useState } from 'react';
import { submitApplication } from '@/lib/application-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, UploadCloud } from 'lucide-react';

export default function ApplicationForm({ jobId, jobTitle }: { jobId: number, jobTitle: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMsg('');

        const formData = new FormData(event.currentTarget);
        formData.append('jobId', jobId.toString());

        try {
            const result = await submitApplication(null, formData);
            if (result?.error) {
                setErrorMsg(result.error);
                if (result.fieldErrors) {
                    console.error(result.fieldErrors);
                    // Could map errors to UI here if needed, showing generic for now
                    setErrorMsg("Please check the required fields.");
                }
            } else if (result?.success) {
                setSuccess(true);
            }
        } catch (e) {
            setErrorMsg("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    if (success) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6 text-center">
                    <h3 className="text-2xl font-bold text-green-700 mb-2">Application Submitted!</h3>
                    <p className="text-green-600">
                        Thank you for applying to <strong>{jobTitle}</strong>. 
                        We have received your application and will review it shortly.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-white">
            <CardContent className="pt-8 px-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Apply for this position</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Please complete this form with accurate and verified data. Ensure that all information provided is truthful and correct.
                    </p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo Upload */}
                    <div className="space-y-2">
                        <Label>Your Photo</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors relative">
                            <input 
                                type="file" 
                                name="photo" 
                                accept="image/jpeg,image/png,image/gif"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handlePhotoChange}
                            />
                            {photoPreview ? (
                                <img src={photoPreview} alt="Preview" className="mx-auto h-32 w-32 object-cover rounded-md" />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <UploadCloud className="h-8 w-8 mb-2" />
                                    <span className="text-sm font-medium text-blue-600">Drop files here or click to upload</span>
                                    <span className="text-xs mt-1">Maximum allowed file size is 10 MB.</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-400">Allowed Type(s): .jpg, .jpeg, .png, .gif</p>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                        <Input id="fullName" name="fullName" required className="h-10" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="nid">NID <span className="text-red-500">*</span></Label>
                        <Input id="nid" name="nid" required placeholder="NID must be 10, 13 or 17 digit long" className="h-10" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth <span className="text-red-500">*</span></Label>
                        <Input id="dob" name="dob" type="date" required className="h-10" />
                    </div>

                    <div className="space-y-2">
                        <Label>Gender <span className="text-red-500">*</span></Label>
                        <div className="flex gap-6 pt-1">
                            {['Male', 'Female', 'Other', 'Rather not Mention'].map((g) => (
                                <label key={g} className="flex items-center space-x-2 cursor-pointer">
                                    <input type="radio" name="gender" value={g} className="accent-rose-500 h-4 w-4" required />
                                    <span className="text-sm text-gray-700">{g}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile No <span className="text-red-500">*</span></Label>
                        <Input id="mobile" name="mobile" required placeholder="Phone Number" className="h-10" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                        <Input id="email" name="email" type="email" required placeholder="Email Address" className="h-10" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="experience">Experience <span className="text-red-500">*</span></Label>
                        <select id="experience" name="experience" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                            <option value="">Select Experience</option>
                            <option value="Less than 1 Year">Less than 1 Year</option>
                            <option value="1-3 Years">1-3 Years</option>
                            <option value="3-5 Years">3-5 Years</option>
                            <option value="5+ Years">5+ Years</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="currentSalary">Current Salary</Label>
                        <Input id="currentSalary" name="currentSalary" className="h-10" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="expectedSalary">Expected Salary</Label>
                        <Input id="expectedSalary" name="expectedSalary" className="h-10" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="education">Latest Education Qualification <span className="text-red-500">*</span></Label>
                        <select id="education" name="education" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                            <option value="">Select Education</option>
                            <option value="PhD">PhD</option>
                            <option value="Masters">Masters</option>
                            <option value="Bachelor">Bachelor</option>
                            <option value="Diploma">Diploma</option>
                            <option value="HSC">HSC</option>
                            <option value="SSC">SSC</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="source">Recruitment Source <span className="text-red-500">*</span></Label>
                        <select id="source" name="source" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" required>
                            <option value="">Select Source</option>
                            <option value="Linkedin">Linkedin</option>
                            <option value="Bdjobs">Bdjobs</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Website">Website</option>
                            <option value="Referral">Referral</option>
                        </select>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="objective">Career Objective <span className="text-red-500">*</span></Label>
                        <Textarea id="objective" name="objective" required placeholder="Write your objective here" className="min-h-[100px]" />
                    </div>

                    {/* Resume Upload */}
                    <div className="space-y-2">
                        <Label htmlFor="resume">Upload CV/Resume <span className="text-red-500">*</span></Label>
                        <div className="flex items-center gap-2">
                             <Input id="resume" name="resume" type="file" accept=".pdf,.doc,.docx" required className="cursor-pointer text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                        </div>
                        <p className="text-xs text-gray-400">Allowed Type(s): .pdf, .doc, .docx</p>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="achievements">Achievement (Related to Career and Study)</Label>
                        <Textarea id="achievements" name="achievements" className="min-h-[100px]" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Your Message (If Any)</Label>
                        <Textarea id="message" name="message" className="min-h-[100px]" />
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">Linkedin Profile</Label>
                            <Input id="linkedin" name="linkedin" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facebook">Facebook Profile</Label>
                            <Input id="facebook" name="facebook" placeholder="www.facebook.com/username" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="portfolio">Personal Website/Portfolio/Github</Label>
                            <Input id="portfolio" name="portfolio" placeholder="www.example.com" />
                        </div>
                    </div>

                    <div className="flex items-start space-x-2 pt-4">
                        <input type="checkbox" id="agreement" name="agreement" required className="mt-1 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                        <label htmlFor="agreement" className="text-sm text-gray-600 leading-tight">
                            By using this form you agree with the storage and handling of your data by this website. <span className="text-red-500">*</span>
                        </label>
                    </div>

                     {/* Captcha Placeholder */}
                     <div className="bg-gray-100 border p-3 rounded-md flex items-center justify-between w-64">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" className="h-6 w-6" disabled checked/>
                            <span className="text-sm text-gray-600">I'm not a robot</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" className="w-8 opacity-50" alt=""/>
                            <span className="text-[10px] text-gray-400">reCAPTCHA</span>
                        </div>
                     </div>

                    <Button type="submit" className="w-32 bg-rose-500 hover:bg-rose-600 text-white" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
