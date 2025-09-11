"use strict";
// src/components/visa/UkVisaForm.tsx
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.UkVisaForm = UkVisaForm;
const utils_1 = require("@/lib/utils");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const form_1 = require("@/components/ui/form");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const actions_1 = require("@/app/application/actions");
const ReviewData_1 = require("./ReviewData");
const visa_schema_1 = require("@/lib/visa-schema");
const checkbox_1 = require("@/components/ui/checkbox");
function UkVisaForm({ application, countryName }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
    // ==========================================================
    // 1. ХУКИ
    // ==========================================================
    const [step, setStep] = (0, react_1.useState)(1);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const [submitError, setSubmitError] = (0, react_1.useState)(null);
    const [isSubmitted, setIsSubmitted] = (0, react_1.useState)(false);
    // Получаем ранее сохраненные данные, если они есть
    const savedData = application.formData || {};
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(visa_schema_1.UkVisaSchema),
        mode: 'onChange',
        // ГАРАНТИРУЕМ, ЧТО НИ ОДНО ПОЛЕ НЕ БУДЕТ UNDEFINED
        defaultValues: {
            // === STEP 1 FIELDS ===
            givenNameFirst: savedData.givenNameFirst || '',
            familyNameFirst: savedData.familyNameFirst || '',
            sex: savedData.sex || undefined, // Для Select `undefined` - это нормально
            email: savedData.email || '',
            telephoneNumber: savedData.telephoneNumber || '',
            dateOfBirth: {
                day: ((_a = savedData.dateOfBirth) === null || _a === void 0 ? void 0 : _a.day) || '',
                month: ((_b = savedData.dateOfBirth) === null || _b === void 0 ? void 0 : _b.month) || '',
                year: ((_c = savedData.dateOfBirth) === null || _c === void 0 ? void 0 : _c.year) || '',
            },
            // === STEP 2 FIELDS ===
            passportNumber: savedData.passportNumber || '',
            issuingAuthority: savedData.issuingAuthority || '',
            issueDate: {
                day: ((_d = savedData.issueDate) === null || _d === void 0 ? void 0 : _d.day) || '',
                month: ((_e = savedData.issueDate) === null || _e === void 0 ? void 0 : _e.month) || '',
                year: ((_f = savedData.issueDate) === null || _f === void 0 ? void 0 : _f.year) || '',
            },
            expiryDate: {
                day: ((_g = savedData.expiryDate) === null || _g === void 0 ? void 0 : _g.day) || '',
                month: ((_h = savedData.expiryDate) === null || _h === void 0 ? void 0 : _h.month) || '',
                year: ((_j = savedData.expiryDate) === null || _j === void 0 ? void 0 : _j.year) || '',
            },
            nationality: savedData.nationality || '',
            countryOfBirth: savedData.countryOfBirth || '',
            placeOfBirth: savedData.placeOfBirth || '',
            // === STEP 3 FIELDS ===
            outOfCountryAddress: savedData.outOfCountryAddress || '',
            townCity: savedData.townCity || '',
            postalCode: savedData.postalCode || '',
            countryRef: savedData.countryRef || '',
            statusOfOwnershipHome: savedData.statusOfOwnershipHome || undefined,
            // === STEP 4 FIELDS ===
            selectedStatuses: savedData.selectedStatuses || [], // Массив должен быть [], а не undefined
            jobTitle: savedData.jobTitle || '',
            employerName: savedData.employerName || '',
            moneyInBankAmount: savedData.moneyInBankAmount || '',
            moneySpendMonth: savedData.moneySpendMonth || '',
        },
    });
    const employmentStatuses = [
        { id: 'status_employed', label: 'Employed' },
        { id: 'status_self-employed', label: 'Self-Employed' },
        { id: 'status_student', label: 'Student' },
        { id: 'status_retired', label: 'Retired' },
        { id: 'status_unemployed', label: 'Unemployed' },
    ];
    // ==========================================================
    // 2. ЛОГИКА
    // ==========================================================
    const totalSteps = 5;
    const fieldsByStep = {
        1: ['givenNameFirst', 'familyNameFirst', 'sex', 'dateOfBirth', 'email', 'telephoneNumber'],
        2: ['passportNumber', 'issuingAuthority', 'issueDate', 'expiryDate', 'nationality', 'countryOfBirth', 'placeOfBirth'],
        3: ['outOfCountryAddress', 'townCity', 'postalCode', 'countryRef', 'statusOfOwnershipHome'], // Добавить поля для 3 шага
        4: ['selectedStatuses', 'jobTitle', 'employerName', 'moneyInBankAmount', 'moneySpendMonth'], // Добавить поля для 4 шага
    };
    const handleNextStep = async () => {
        const fields = fieldsByStep[step];
        if (!fields || fields.length === 0) {
            setStep((s) => s + 1);
            return;
        }
        const isValid = await form.trigger(fields); // as any - временное решение для вложенных полей
        if (isValid) {
            setStep((s) => s + 1);
        }
    };
    // ИСПРАВЛЕНА ТИПИЗАЦИЯ `values`
    async function onSubmit(values) {
        setIsSubmitting(true);
        setSubmitError(null);
        const result = await (0, actions_1.saveApplicationData)({
            accessCode: application.accessCode,
            formData: values, // `values` уже имеют правильный тип UkVisaDataType
        });
        if (result.success) {
            setIsSubmitted(true);
        }
        else {
            setSubmitError(result.message || 'An unknown error occurred.');
        }
        setIsSubmitting(false);
    }
    // ==========================================================
    // 3. РЕНДЕРИНГ
    // ==========================================================
    if (isSubmitted) {
        return (<div className="text-center py-20 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-green-600">Application Submitted!</h2>
        <p className="mt-4 text-gray-700 max-w-md mx-auto">
          Your application has been successfully sent to your travel agent. You can now close this window.
        </p>
      </div>);
    }
    return (<card_1.Card className="w-full">
      <card_1.CardHeader>
        <card_1.CardTitle>{countryName} Visa Application Form</card_1.CardTitle>
        <card_1.CardDescription>
          {step <= 4 ? `Step ${step} of 4 - Section Name` : 'Step 5 - Review'}
        </card_1.CardDescription>
      </card_1.CardHeader>
      <form_1.Form {...form}> 
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <card_1.CardContent className="min-h-[300px]">
            {/* Step 1 */}
            {step === 1 && (<div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="givenNameFirst" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>First Name</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., Alisher" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                <form_1.FormField control={form.control} name="familyNameFirst" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Last Name</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., Usmanov" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="email" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Email Address</form_1.FormLabel><form_1.FormControl><input_1.Input type="email" placeholder="user@example.com" {...field}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                <form_1.FormField control={form.control} name="telephoneNumber" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Phone Number</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="+998 90 123 45 67" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[\d\s()+-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <form_1.FormField control={form.control} name="sex" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Gender</form_1.FormLabel><select_1.Select onValueChange={field.onChange} defaultValue={field.value}><form_1.FormControl><select_1.SelectTrigger><select_1.SelectValue placeholder="Select gender"/></select_1.SelectTrigger></form_1.FormControl><select_1.SelectContent><select_1.SelectItem value="M">Male</select_1.SelectItem><select_1.SelectItem value="F">Female</select_1.SelectItem><select_1.SelectItem value="OTHER">Unspecified</select_1.SelectItem></select_1.SelectContent></select_1.Select><form_1.FormMessage /></form_1.FormItem>)}/>
                <div className="space-y-2">
                    <form_1.FormLabel>Date of Birth</form_1.FormLabel>
                    <div className="flex gap-2">
                    <form_1.FormField control={form.control} name="dateOfBirth.day" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="DD" {...field} maxLength={2} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                    <form_1.FormField control={form.control} name="dateOfBirth.month" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="MM" {...field} maxLength={2} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                    <form_1.FormField control={form.control} name="dateOfBirth.year" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="YYYY" {...field} maxLength={4} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                    </div>
                    <form_1.FormMessage>{((_l = (_k = form.formState.errors.dateOfBirth) === null || _k === void 0 ? void 0 : _k.root) === null || _l === void 0 ? void 0 : _l.message) || ((_o = (_m = form.formState.errors.dateOfBirth) === null || _m === void 0 ? void 0 : _m.day) === null || _o === void 0 ? void 0 : _o.message) || ((_q = (_p = form.formState.errors.dateOfBirth) === null || _p === void 0 ? void 0 : _p.month) === null || _q === void 0 ? void 0 : _q.message) || ((_s = (_r = form.formState.errors.dateOfBirth) === null || _r === void 0 ? void 0 : _r.year) === null || _s === void 0 ? void 0 : _s.message)}</form_1.FormMessage>
                </div>
                </div>
            </div>)}

            {/* Step 2 */}
            {step === 2 && (<div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Passport & Nationality</h3>
                
                <form_1.FormField control={form.control} name="passportNumber" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Passport or Travel Document Number </form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., AB1234567" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ]{0,2}(?:\d{0,7})?$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                
                <form_1.FormField control={form.control} name="issuingAuthority" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Issuing Authority</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., UZBEKISTAN" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ0-9\s]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-2">
                    <form_1.FormLabel>Issue Date</form_1.FormLabel>
                    <div className="flex gap-2">
                      <form_1.FormField control={form.control} name="issueDate.day" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="DD" {...field} maxLength={2} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                      <form_1.FormField control={form.control} name="issueDate.month" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="MM" {...field} maxLength={2} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                      <form_1.FormField control={form.control} name="issueDate.year" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="YYYY" {...field} maxLength={4} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                    </div>
                    <form_1.FormMessage>{((_u = (_t = form.formState.errors.issueDate) === null || _t === void 0 ? void 0 : _t.root) === null || _u === void 0 ? void 0 : _u.message) || ((_w = (_v = form.formState.errors.issueDate) === null || _v === void 0 ? void 0 : _v.day) === null || _w === void 0 ? void 0 : _w.message)}</form_1.FormMessage>
                  </div>

                  <div className="space-y-2">
                    <form_1.FormLabel>Expiry Date</form_1.FormLabel>
                    <div className="flex gap-2">
                      <form_1.FormField control={form.control} name="expiryDate.day" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="DD" {...field} maxLength={2} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                      <form_1.FormField control={form.control} name="expiryDate.month" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="MM" {...field} maxLength={2} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                      <form_1.FormField control={form.control} name="expiryDate.year" render={({ field }) => (<form_1.FormItem className="flex-1"><form_1.FormControl><input_1.Input placeholder="YYYY" {...field} maxLength={4} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^\d*$/); field.onChange(filtered); }}/></form_1.FormControl></form_1.FormItem>)}/>
                    </div>
                    <form_1.FormMessage>{((_y = (_x = form.formState.errors.expiryDate) === null || _x === void 0 ? void 0 : _x.root) === null || _y === void 0 ? void 0 : _y.message) || ((_0 = (_z = form.formState.errors.expiryDate) === null || _z === void 0 ? void 0 : _z.day) === null || _0 === void 0 ? void 0 : _0.message)}</form_1.FormMessage>
                  </div>
                </div>
                
                <form_1.FormField control={form.control} name="nationality" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Nationality</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., UZBEKISTAN" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField control={form.control} name="countryOfBirth" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Country of Birth</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., UZBEKISTAN" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                  <form_1.FormField control={form.control} name="placeOfBirth" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Place of Birth</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., TASHKENT" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                </div>
              </div>)}
            {/* Step 3 */}
            {step === 3 && (<div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Address & Living Situation</h3>

                <form_1.FormField control={form.control} name="outOfCountryAddress" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Your Full Address</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., 7 Amir Temur Avenue" {...field}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField control={form.control} name="townCity" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Town / City</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., Tashkent" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                  <form_1.FormField control={form.control} name="postalCode" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Postal Code (Optional)</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., 100000" {...field}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                </div>

                <form_1.FormField control={form.control} name="countryRef" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Country of Residence</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., UZBEKISTAN" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>

                <form_1.FormField control={form.control} name="statusOfOwnershipHome" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Home Ownership Status</form_1.FormLabel><select_1.Select onValueChange={field.onChange} defaultValue={field.value}><form_1.FormControl><select_1.SelectTrigger><select_1.SelectValue placeholder="Select your status"/></select_1.SelectTrigger></form_1.FormControl><select_1.SelectContent><select_1.SelectItem value="OWNED">I own my home</select_1.SelectItem><select_1.SelectItem value="RENTED">I rent my home</select_1.SelectItem><select_1.SelectItem value="OTHER">Other (e.g., live with family)</select_1.SelectItem></select_1.SelectContent></select_1.Select><form_1.FormMessage /></form_1.FormItem>)}/>
              </div>)}
            {/* Step 4 */}
            {step === 4 && (<div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Employment & Finances</h3>
                <form_1.FormField control={form.control} name="selectedStatuses" render={() => (<form_1.FormItem><div className="mb-4"><form_1.FormLabel className="text-base">What is your current employment status?</form_1.FormLabel><form_1.FormDescription>Select all that apply.</form_1.FormDescription></div><div className="space-y-2">{employmentStatuses.map((item) => (<form_1.FormField key={item.id} control={form.control} name="selectedStatuses" render={({ field }) => { var _a; return (<form_1.FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0"><form_1.FormControl><checkbox_1.Checkbox checked={(_a = field.value) === null || _a === void 0 ? void 0 : _a.includes(item.id)} onCheckedChange={(checked) => (checked ? field.onChange([...(field.value || []), item.id]) : field.onChange((field.value || []).filter((value) => value !== item.id)))}/></form_1.FormControl><form_1.FormLabel className="font-normal">{item.label}</form_1.FormLabel></form_1.FormItem>); }}/>))}</div><form_1.FormMessage /></form_1.FormItem>)}/>
                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                <form_1.FormField control={form.control} name="jobTitle" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Your Job Title</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., Software Engineer" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                <form_1.FormField control={form.control} name="employerName" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Company Name</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., Google LLC" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>

                </div>

                <h4 className="text-lg font-semibold pt-4">Your Finances</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <form_1.FormField control={form.control} name="moneyInBankAmount" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Total money you have for this trip (USD)</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., 5000" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[\d.,]*$/); field.onChange(filtered.replace(/,/g, '.').replace(/(\..*)\./g, '$1')); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                  <form_1.FormField control={form.control} name="moneySpendMonth" render={({ field }) => (<form_1.FormItem><form_1.FormLabel>Your average monthly spending (USD)</form_1.FormLabel><form_1.FormControl><input_1.Input placeholder="e.g., 800" {...field} onChange={(e) => { const filtered = (0, utils_1.filterInput)(e.target.value, /^[\d.,]*$/); field.onChange(filtered.replace(/,/g, '.').replace(/(\..*)\./g, '$1')); }}/></form_1.FormControl><form_1.FormMessage /></form_1.FormItem>)}/>
                </div>
              </div>)}
            {/* ... JSX для шагов 2, 3, 4 ... */}
                        {/* Review Step */}
            {step === 5 && <ReviewData_1.ReviewData />}
          </card_1.CardContent>
          <card_1.CardFooter className="flex justify-between">
            <button_1.Button type="button" variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} className={step === 1 ? 'invisible' : 'visible'}>
              Previous
            </button_1.Button>
            {step < totalSteps && (<button_1.Button type="button" onClick={handleNextStep}>Next</button_1.Button>)}
            {step === totalSteps && (<div className="flex flex-col items-end">
                <button_1.Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button_1.Button>
                {submitError && <p className="text-sm text-red-600 mt-2">{submitError}</p>}
              </div>)}
          </card_1.CardFooter>
        </form>
      </form_1.Form>
    </card_1.Card>);
}
