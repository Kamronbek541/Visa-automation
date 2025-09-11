// src/components/visa/UkVisaForm.tsx
'use client';
import { useForm, useFieldArray } from 'react-hook-form';
import { filterInput } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { z } from 'zod'; // z нужен для `z.infer`, но саму схему мы импортируем
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Application } from '@prisma/client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveApplicationData } from '@/app/application/actions';
import { ReviewData } from './ReviewData';
import { UkVisaSchema, UkVisaDataType } from '@/lib/visa-schema'; 
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import VisaLanguageSwitcher from './LanguageSwitcher';


// Локальную formSchema можно полностью УДАЛИТЬ. Она больше не нужна.

type UkVisaFormProps = {
  application: Application;
  countryName: string; 
  isAdminMode?: boolean;
};
export function UkVisaForm({ application, countryName, isAdminMode = false }: UkVisaFormProps) {
  
  // ==========================================================
  // 1. ХУКИ
  // ==========================================================
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const t = useTranslations('form');

  const safeT = (key: string, params?: any) => {
    try {
      return t(key, params);
    } catch (error) {
      console.warn(`Translation key "${key}" not found`);
      return key; // Возвращаем ключ как fallback
    }
  };
  
  // Получаем ранее сохраненные данные, если они есть
  const savedData = application.formData as Partial<UkVisaDataType> || {};

  const form = useForm<UkVisaDataType>({
    resolver: zodResolver(UkVisaSchema),
    mode: 'onChange',
    // ГАРАНТИРУЕМ, ЧТО НИ ОДНО ПОЛЕ НЕ БУДЕТ UNDEFINED
    defaultValues: {
      // === STEP 1 FIELDS ===
      givenNameFirst: savedData.givenNameFirst || '',
      familyNameFirst: savedData.familyNameFirst || '',
      sex: savedData.sex || undefined, // Для Select `undefined` - это нормально
      relationshipStatus: savedData.relationshipStatus || undefined,
      partnerDetails: savedData.partnerDetails || undefined,
      telephoneNumber: savedData.telephoneNumber || '',
      dateOfBirth: {
          day: savedData.dateOfBirth?.day || '',
          month: savedData.dateOfBirth?.month || '',
          year: savedData.dateOfBirth?.year || '',
      },
      // === STEP 2 FIELDS ===
      passportNumber: savedData.passportNumber || '',
      issuingAuthority: savedData.issuingAuthority || '',
      issueDate: {
        day: savedData.issueDate?.day || '',
        month: savedData.issueDate?.month || '',
        year: savedData.issueDate?.year || '',
      },
      expiryDate: {
        day: savedData.expiryDate?.day || '',
        month: savedData.expiryDate?.month || '',
        year: savedData.expiryDate?.year || '',
      },
      nationality: savedData.nationality || 'UZBEKISTAN', // Можем задать по умолчанию
      placeOfBirth: savedData.placeOfBirth || '',
      nationalIdCard: {
        documentNumber: savedData.nationalIdCard?.documentNumber || '',
        issuingAuthority: savedData.nationalIdCard?.issuingAuthority || 'UZBEKISTAN',
        issueDate: {
          day: savedData.nationalIdCard?.issueDate?.day || '',
          month: savedData.nationalIdCard?.issueDate?.month || '',
          year: savedData.nationalIdCard?.issueDate?.year || '',
        },
        expiryDate: {
          day: savedData.nationalIdCard?.expiryDate?.day || '',
          month: savedData.nationalIdCard?.expiryDate?.month || '',
          year: savedData.nationalIdCard?.expiryDate?.year || '',
        },
      },

      // === STEP 3 FIELDS ===
      outOfCountryAddress: savedData.outOfCountryAddress || '',
      townCity: savedData.townCity || '',
      postalCode: savedData.postalCode || '',
      countryRef: savedData.countryRef || '',
      statusOfOwnershipHome: savedData.statusOfOwnershipHome || undefined,
      timeLivedAtAddressInMonths: savedData.timeLivedAtAddressInMonths || 0, // ИСПРАВЛЕНО
      otherOwnershipDetails: savedData.otherOwnershipDetails || '',
      previousAddress: {
        addressLine1: savedData.previousAddress?.addressLine1 || '',
        townCity: savedData.previousAddress?.townCity || '',
        country: savedData.previousAddress?.country || '',
        startDate: {
          month: savedData.previousAddress?.startDate?.month || '',
          year: savedData.previousAddress?.startDate?.year || '',
        },
        endDate: {
          month: savedData.previousAddress?.endDate?.month || '',
          year: savedData.previousAddress?.endDate?.year || '',
        },
      },
      dependants: savedData.dependants || [],
      parentalConsent: savedData.parentalConsent || undefined,
      motherDetails: savedData.motherDetails || undefined,
      fatherDetails: savedData.fatherDetails || undefined,

      // === STEP 4 FIELDS ===
      employmentType: savedData.employmentType || undefined,
      employerDetails: savedData.employerDetails || undefined,
      selfEmployedDetails: savedData.selfEmployedDetails || undefined,
      moneyInBankAmountUSD: savedData.moneyInBankAmountUSD || '',
      moneySpendMonth: savedData.moneySpendMonth || '',
      hotelBookingDetails: savedData.hotelBookingDetails || undefined,


      ukTravelHistory: {
        hasVisited: savedData.ukTravelHistory?.hasVisited || false,
        previousVisits: savedData.ukTravelHistory?.previousVisits || [],
      },
      commonwealthTravelHistory: savedData.commonwealthTravelHistory || [],
      worldTravelHistory: savedData.worldTravelHistory || [],
    },

  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "dependants",
  });
  const { fields: visitFields, append: appendVisit, remove: removeVisit } = useFieldArray({
    control: form.control,
    name: "ukTravelHistory.previousVisits",
  });
  const { fields: cwVisitFields, append: appendCwVisit, remove: removeCwVisit } = useFieldArray({
    control: form.control,
    name: "commonwealthTravelHistory",
  });
  const { fields: worldVisitFields, append: appendWorldVisit, remove: removeWorldVisit } = useFieldArray({
    control: form.control,
    name: "worldTravelHistory",
  });


const timeLived = form.watch('timeLivedAtAddressInMonths');
const employmentType = form.watch('employmentType');
const relationshipStatus = form.watch('relationshipStatus');
const hasVisitedUK = form.watch('ukTravelHistory.hasVisited');

useEffect(() => {
  if (timeLived >= 24) {
    form.setValue('previousAddress', undefined, { shouldValidate: false });
  }
}, [timeLived, form]);

useEffect(() => {
  if (employmentType !== 'EMPLOYED' && employmentType !== 'STUDENT_EMPLOYED') {
    form.setValue('employerDetails', undefined, { shouldValidate: false });
  }
  if (employmentType !== 'SELF_EMPLOYED') {
    form.setValue('selfEmployedDetails', undefined, { shouldValidate: false });
  }
}, [employmentType, form]);

useEffect(() => {
  if (relationshipStatus !== 'M') {
    form.setValue('partnerDetails', undefined, { shouldValidate: false });
  }
}, [relationshipStatus, form]);

useEffect(() => {
  if (!hasVisitedUK) {
    form.setValue('ukTravelHistory.previousVisits', [], { shouldValidate: false });
  }
}, [hasVisitedUK, form]);


  // ==========================================================
  // 2. ЛОГИКА
  // ==========================================================
  const totalSteps = 8;

  const fieldsByStep: { [key: number]: (keyof UkVisaDataType)[] } = {
    1: ['givenNameFirst', 'familyNameFirst', 'sex', 'dateOfBirth', 'telephoneNumber',   'relationshipStatus', ],
    2: ['partnerDetails', 'dependants','parentalConsent','motherDetails','fatherDetails'], 
    3: ['passportNumber', 'issuingAuthority', 'issueDate', 'expiryDate', 'nationality', 'placeOfBirth', 'nationalIdCard'],
    4: ['outOfCountryAddress', 'townCity', 'postalCode', 'countryRef', 'statusOfOwnershipHome',  'timeLivedAtAddressInMonths', 'otherOwnershipDetails','previousAddress'], // Добавить поля для 3 шага
    5: [  'employmentType', 'moneyInBankAmountUSD', 'moneySpendMonth','employerDetails.name','employerDetails.address','employerDetails.townCity','employerDetails.country','employerDetails.phoneCode','employerDetails.phoneNumber','employerDetails.startDate','employerDetails.jobTitle','employerDetails.annualSalary','employerDetails.jobDescription','selfEmployedDetails.jobTitle','selfEmployedDetails.annualIncome'],
    6 : ['ukTravelHistory'],
    7: ['commonwealthTravelHistory', "worldTravelHistory"],
  };

  const handleNextStep = async () => {
    const fields = fieldsByStep[step];
    if (!fields || fields.length === 0) {
      setStep((s) => s + 1);
      return;
    }
    const isValid = await form.trigger(fields as any); // as any - временное решение для вложенных полей
    if (isValid) {
      setStep((s) => s + 1);
    }
  };

  const getStepTitle = (stepNumber: number): string => {
    const stepTitles = {
      1: safeT('personalInfo'),
      2: safeT('familyDetails'),
      3: safeT('passportNationality'),
      4: safeT('addressLiving'),
      5: safeT('employmentFinances'),
      6: safeT('ukTravelHistory'),
      7: safeT('otherTravelHistory'),
      8: safeT('review')
    };
    return stepTitles[stepNumber as keyof typeof stepTitles] || '';
  };


  async function onSubmit(values: UkVisaDataType) {
    setIsSubmitting(true);
    setSubmitError(null);
  
    const result = await saveApplicationData({
      accessCode: application.accessCode,
      formData: values,
    });
    
    if (result.success) {
      if (isAdminMode) {
        // РЕЖИМ АГЕНТА: перенаправляем в дашборд
        alert('Application data updated successfully!');
        router.push('/agent/dashboard');
        router.refresh();
      } else {
        // РЕЖИМ КЛИЕНТА: ПЕРЕНАПРАВЛЯЕМ НА СТРАНИЦУ УСПЕХА
        router.push('/application/success');
      }
    } else {
      setSubmitError(result.message || 'An unknown error occurred.');
      setIsSubmitting(false); // Оставляем isSubmitting(false) только в случае ошибки
    }
    // Не нужно вызывать setIsSubmitting(false) в случае успеха, так как мы уходим со страницы
  }

  return (
    <Card className="w-full">
      <CardHeader>
        {/* <CardTitle>{countryName} Visa Application Form</CardTitle>
        <CardDescription>
          {step <= 8 ? `Step ${step} of 8 - Section Name` : 'Step 8 - Review'}
        </CardDescription> */}
        <div className="flex justify-between items-start">
        <div>
          <CardTitle>{safeT('title', { country: countryName })}</CardTitle>
          <CardDescription>
            {step <= 8 ? safeT('step', { step, section: getStepTitle(step) }) : safeT('review')}
          </CardDescription>
        </div>
        <VisaLanguageSwitcher />
      </div>
      </CardHeader>
      <Form {...form}> 
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="min-h-[300px]">
            {/* Step 1 */}
            {step === 1 && (
            <div className="space-y-4">
                {/* <h3 className="text-xl font-semibold mb-4 border-b pb-2">Personal Information</h3> */}
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">{t('personalInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="givenNameFirst" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input placeholder="e.g., Alisher" {...field} onChange={(e) => {const filtered = filterInput(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered);}}/></FormControl><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="familyNameFirst" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input placeholder="e.g., Usmanov" {...field} onChange={(e) => {const filtered = filterInput(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered);}}/></FormControl><FormMessage /></FormItem>)}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="telephoneNumber" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="+998 90 123 45 67" {...field} onChange={(e) => {const filtered = filterInput(e.target.value, /^[\d\s()+-]*$/); field.onChange(filtered);}}/></FormControl><FormMessage /></FormItem>)}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem><SelectItem value="OTHER">Unspecified</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                <FormField control={form.control} name="relationshipStatus" render={({ field }) => (<FormItem><FormLabel>Marital Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="S">Single</SelectItem><SelectItem value="M">Married or civil partner</SelectItem><SelectItem value="D">Divorced</SelectItem><SelectItem value="U">Unmarried partner</SelectItem><SelectItem value="P">Separated</SelectItem><SelectItem value="W">Widowed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>
                <div className="space-y-2">
                    <FormLabel>Date of Birth</FormLabel>
                    <div className="flex gap-2">
                    <FormField control={form.control} name="dateOfBirth.day" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} maxLength={2} onChange={(e) => {const filtered = filterInput(e.target.value, /^\d*$/); field.onChange(filtered);}}/></FormControl></FormItem>)}/>
                    <FormField control={form.control} name="dateOfBirth.month" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} maxLength={2} onChange={(e) => {const filtered = filterInput(e.target.value, /^\d*$/); field.onChange(filtered);}}/></FormControl></FormItem>)}/>
                    <FormField control={form.control} name="dateOfBirth.year" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} maxLength={4} onChange={(e) => {const filtered = filterInput(e.target.value, /^\d*$/); field.onChange(filtered);}}/></FormControl></FormItem>)}/>
                    </div>
                    <FormMessage>{form.formState.errors.dateOfBirth?.root?.message || form.formState.errors.dateOfBirth?.day?.message || form.formState.errors.dateOfBirth?.month?.message || form.formState.errors.dateOfBirth?.year?.message}</FormMessage>
                </div>
                </div>
            </div>
            )}
            {/* НОВЫЙ ШАГ 2: FAMILY DETAILS */}
            {/* ========================================================== */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold mb-4 border-b pb-2">Family Details</h3>

                {/* === PARTNER SECTION (Перенесен сюда) === */}
                {form.watch('relationshipStatus') === 'M' && (
                    <div className="space-y-4 animate-in fade-in-50">
                        <h4 className="text-lg font-semibold">Partner's Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="partnerDetails.givenName" render={({ field }) => (<FormItem><FormLabel>Partner's First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="partnerDetails.familyName" render={({ field }) => (<FormItem><FormLabel>Partner's Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="space-y-2">
                            <FormLabel>Partner's Date of Birth</FormLabel>
                            <div className="flex gap-2">
                                <FormField control={form.control} name="partnerDetails.dateOfBirth.day" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="partnerDetails.dateOfBirth.month" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name="partnerDetails.dateOfBirth.year" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} /></FormControl></FormItem>)} />
                            </div>
                            <FormMessage>{form.formState.errors.partnerDetails?.dateOfBirth?.root?.message}</FormMessage>
                        </div>
                        <FormField control={form.control} name="partnerDetails.nationality" render={({ field }) => (<FormItem><FormLabel>Partner's Nationality</FormLabel><FormControl><Input placeholder="e.g., UZBEKISTAN" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="partnerDetails.isTravellingWithYou" render={({ field }) => (<FormItem><FormLabel>Is your partner travelling with you?</FormLabel><Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                        {form.watch('partnerDetails.isTravellingWithYou') && (
                            <FormField control={form.control} name="partnerDetails.passportNumber" render={({ field }) => (<FormItem><FormLabel>Partner's Passport Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        )}
                    </div>
                )}

                {/* === DEPENDANTS SECTION === */}
                <div className="pt-6 mt-6 border-t">
                    <FormLabel className="text-lg font-semibold">Do you have any children (dependants)?</FormLabel>
                    
                    {fields.map((field, index) => (
                        <div key={field.id} className="p-4 mt-4 border rounded-md relative animate-in fade-in-50">
                            <h4 className="font-semibold mb-4">Child {index + 1}</h4>
                            <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50">Remove</Button>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name={`dependants.${index}.givenName`} render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name={`dependants.${index}.familyName`} render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="space-y-2">
                                    <FormLabel>Date of Birth</FormLabel>
                                    <div className="flex gap-2">
                                        <FormField control={form.control} name={`dependants.${index}.dateOfBirth.day`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name={`dependants.${index}.dateOfBirth.month`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} /></FormControl></FormItem>)} />
                                        <FormField control={form.control} name={`dependants.${index}.dateOfBirth.year`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} /></FormControl></FormItem>)} />
                                    </div>
                                    <FormMessage>{form.formState.errors.dependants?.[index]?.dateOfBirth?.root?.message}</FormMessage>
                                </div>
                                <FormField control={form.control} name={`dependants.${index}.isTravellingWithYou`} render={({ field }) => (<FormItem><FormLabel>Is this child travelling with you?</FormLabel><Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl><SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                {form.watch(`dependants.${index}.isTravellingWithYou`) && (
                                    <FormField control={form.control} name={`dependants.${index}.passportNumber`} render={({ field }) => (<FormItem><FormLabel>Child's Passport Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                )}
                            </div>
                        </div>
                    ))}

                    <Button type="button" variant="outline" className="mt-4" onClick={() => append({ 
                        givenName: '', familyName: '', dateOfBirth: {day: '', month: '', year: ''}, isTravellingWithYou: false, passportNumber: '' 
                    })}>
                        + Add Another Child
                    </Button>
                </div>

                {/* БЛОК ДЛЯ ДАННЫХ О РОДИТЕЛЯХ */}
                {/* ========================================================== */}
                <div className="pt-6 mt-6 border-t">
                    <FormField
                      control={form.control} name="parentalConsent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Do you have details for your parents?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="BOTH">Yes, for both parents</SelectItem>
                              <SelectItem value="MOTHER_ONLY">Only for my mother</SelectItem>
                              <SelectItem value="FATHER_ONLY">Only for my father</SelectItem>
                              <SelectItem value="NONE">No, I do not have these details</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Условный блок для Матери */}
                    {(form.watch('parentalConsent') === 'BOTH' || form.watch('parentalConsent') === 'MOTHER_ONLY') && (
                        <div className="p-4 mt-4 border rounded-md space-y-4 animate-in fade-in-50">
                            <h4 className="font-semibold">Mother's Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="motherDetails.givenName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="motherDetails.familyName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="space-y-2">
                                <FormLabel>Date of Birth</FormLabel>
                                <div className="flex gap-2">
                                    <FormField control={form.control} name="motherDetails.dateOfBirth.day" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="motherDetails.dateOfBirth.month" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="motherDetails.dateOfBirth.year" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} /></FormControl></FormItem>)} />
                                </div>
                                <FormMessage>{form.formState.errors.motherDetails?.dateOfBirth?.root?.message}</FormMessage>
                            </div>
                            <FormField control={form.control} name="motherDetails.nationality" render={({ field }) => (<FormItem><FormLabel>Nationality</FormLabel><FormControl><Input placeholder="e.g., Uzbekistan" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    )}
                    
                    {/* Условный блок для Отца */}
                    {(form.watch('parentalConsent') === 'BOTH' || form.watch('parentalConsent') === 'FATHER_ONLY') && (
                        <div className="p-4 mt-4 border rounded-md space-y-4 animate-in fade-in-50">
                            <h4 className="font-semibold">Father's Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField control={form.control} name="fatherDetails.givenName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="fatherDetails.familyName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="space-y-2">
                                <FormLabel>Date of Birth</FormLabel>
                                <div className="flex gap-2">
                                    <FormField control={form.control} name="fatherDetails.dateOfBirth.day" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="fatherDetails.dateOfBirth.month" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="fatherDetails.dateOfBirth.year" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} /></FormControl></FormItem>)} />
                                </div>
                                <FormMessage>{form.formState.errors.fatherDetails?.dateOfBirth?.root?.message}</FormMessage>
                            </div>
                            <FormField control={form.control} name="fatherDetails.nationality" render={({ field }) => (<FormItem><FormLabel>Nationality</FormLabel><FormControl><Input placeholder="e.g., Uzbekistan" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    )}
                </div>
              </div>
            )}
            {/* Step 3 */}
            {step === 3 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Passport & Nationality</h3>

                    {/* --- Passport Details --- */}
                    <FormField control={form.control} name="passportNumber" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Passport or Travel Document Number</FormLabel>
                            <FormControl><Input placeholder="e.g., AA1234567" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="issuingAuthority" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Issuing Authority</FormLabel>
                            <FormControl><Input placeholder="e.g., UZBEKISTAN" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-2">
                            <FormLabel>Passport Issue Date</FormLabel>
                            <div className="flex gap-2">
                                <FormField control={form.control} name="issueDate.day" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} maxLength={2} /></FormControl></FormItem> )} />
                                <FormField control={form.control} name="issueDate.month" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} maxLength={2} /></FormControl></FormItem> )} />
                                <FormField control={form.control} name="issueDate.year" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} maxLength={4} /></FormControl></FormItem> )} />
                            </div>
                            <FormMessage>{form.formState.errors.issueDate?.root?.message}</FormMessage>
                        </div>
                        <div className="space-y-2">
                            <FormLabel>Passport Expiry Date</FormLabel>
                            <div className="flex gap-2">
                                <FormField control={form.control} name="expiryDate.day" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} maxLength={2} /></FormControl></FormItem> )} />
                                <FormField control={form.control} name="expiryDate.month" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} maxLength={2} /></FormControl></FormItem> )} />
                                <FormField control={form.control} name="expiryDate.year" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} maxLength={4} /></FormControl></FormItem> )} />
                            </div>
                            <FormMessage>{form.formState.errors.expiryDate?.root?.message}</FormMessage>
                        </div>
                    </div>
                    <FormField control={form.control} name="nationality" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl><Input placeholder="e.g., UZBEKISTAN" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="placeOfBirth" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Place of Birth</FormLabel>
                            <FormControl><Input placeholder="e.g., TASHKENT" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    {/* --- National ID Card Section --- */}
                    <div className="mt-6 pt-6 border-t border-dashed space-y-4">
                        <h3 className="text-lg font-semibold">National Identity Card</h3>
                        <FormField control={form.control} name="nationalIdCard.documentNumber" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID Card Number</FormLabel>
                                <FormControl><Input placeholder="e.g., CC1234567" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-2">
                                <FormLabel>ID Card Issue Date</FormLabel>
                                <div className="flex gap-2">
                                    <FormField control={form.control} name="nationalIdCard.issueDate.day" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} maxLength={2} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="nationalIdCard.issueDate.month" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} maxLength={2} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="nationalIdCard.issueDate.year" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} maxLength={4} /></FormControl></FormItem> )} />
                                </div>
                                <FormMessage>{form.formState.errors.nationalIdCard?.issueDate?.root?.message}</FormMessage>
                            </div>
                            <div className="space-y-2">
                                <FormLabel>ID Card Expiry Date</FormLabel>
                                <div className="flex gap-2">
                                    <FormField control={form.control} name="nationalIdCard.expiryDate.day" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="DD" {...field} maxLength={2} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="nationalIdCard.expiryDate.month" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} maxLength={2} /></FormControl></FormItem> )} />
                                    <FormField control={form.control} name="nationalIdCard.expiryDate.year" render={({ field }) => ( <FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} maxLength={4} /></FormControl></FormItem> )} />
                                </div>
                                <FormMessage>{form.formState.errors.nationalIdCard?.expiryDate?.root?.message}</FormMessage>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {/* Step 4 */}

{step === 4 && (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Address & Living Situation</h3>

        {/* --- Current Address --- */}
        <FormField control={form.control} name="outOfCountryAddress" render={({ field }) => (<FormItem><FormLabel>Your Full Address</FormLabel><FormControl><Input placeholder="e.g., 7 Amir Temur Avenue" {...field} /></FormControl><FormMessage /></FormItem>)}/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="townCity" render={({ field }) => (<FormItem><FormLabel>Town / City</FormLabel><FormControl><Input placeholder="e.g., Tashkent" {...field} onChange={(e) => {const filtered = filterInput(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered);}} /></FormControl><FormMessage /></FormItem>)}/>
            <FormField control={form.control} name="postalCode" render={({ field }) => (<FormItem><FormLabel>Postal Code (Optional)</FormLabel><FormControl><Input placeholder="e.g., 100000" {...field} /></FormControl><FormMessage /></FormItem>)}/>
        </div>
        <FormField control={form.control} name="countryRef" render={({ field }) => (<FormItem><FormLabel>Country of Residence</FormLabel><FormControl><Input placeholder="e.g., UZBEKISTAN" {...field} onChange={(e) => {const filtered = filterInput(e.target.value, /^[a-zA-Zа-яА-ЯёЁ\s-]*$/); field.onChange(filtered);}} /></FormControl><FormMessage /></FormItem>)}/>
        
        {/* --- Living Situation --- */}
        <FormField 
          control={form.control} 
          name="timeLivedAtAddressInMonths" 
          render={({ field }) => (
            <FormItem>
              <FormLabel>How long have you lived at this address? (in months)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g., 24" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField control={form.control} name="statusOfOwnershipHome" render={({ field }) => (<FormItem><FormLabel>Home Ownership Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select your status" /></SelectTrigger></FormControl><SelectContent><SelectItem value="OWNED">I own my home</SelectItem><SelectItem value="RENTED">I rent my home</SelectItem><SelectItem value="OTHER">Other (e.g., live with family)</SelectItem></SelectContent></Select><FormMessage /></FormItem>)}/>

        {form.watch('statusOfOwnershipHome') === 'OTHER' && (
            <FormField control={form.control} name="otherOwnershipDetails" render={({ field }) => (<FormItem><FormLabel>Please describe your living situation</FormLabel><FormControl><Input placeholder="e.g., Living with parents" {...field} /></FormControl><FormMessage /></FormItem>)}/>
        )}

        {/* Условный блок для предыдущего адреса */}
        {form.watch('timeLivedAtAddressInMonths') < 24 && (
            <div className="mt-6 pt-6 border-t border-dashed space-y-4 animate-in fade-in-50">
                <h3 className="text-xl font-semibold text-gray-800">Previous Address</h3>
                <p className="text-sm text-gray-500">
                    Please provide your previous address as you have lived at the current one for less than 2 years.
                </p>
                
                <FormField control={form.control} name="previousAddress.addressLine1" render={({ field }) => (<FormItem><FormLabel>Previous Full Address</FormLabel><FormControl><Input placeholder="e.g., 123 Old Street" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="previousAddress.townCity" render={({ field }) => (<FormItem><FormLabel>Town / City</FormLabel><FormControl><Input placeholder="e.g., Samarkand" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="previousAddress.country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="e.g., UZBEKISTAN" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-2">
                    <FormLabel>Start Date at Previous Address</FormLabel>
                    <div className="flex gap-2">
                        <FormField control={form.control} name="previousAddress.startDate.month" render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="MM" {...field} maxLength={2} /></FormControl> </FormItem> )} />
                        <FormField control={form.control} name="previousAddress.startDate.year" render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="YYYY" {...field} maxLength={4} /></FormControl> </FormItem> )} />
                    </div>
                    <FormMessage>{form.formState.errors.previousAddress?.startDate?.root?.message}</FormMessage>
                  </div>
                  <div className="space-y-2">
                    <FormLabel>End Date at Previous Address</FormLabel>
                    <div className="flex gap-2">
                        <FormField control={form.control} name="previousAddress.endDate.month" render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="MM" {...field} maxLength={2} /></FormControl> </FormItem> )} />
                        <FormField control={form.control} name="previousAddress.endDate.year" render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="YYYY" {...field} maxLength={4} /></FormControl> </FormItem> )} />
                    </div>
                    <FormMessage>{form.formState.errors.previousAddress?.endDate?.root?.message}</FormMessage>
                  </div>
                </div>
            </div>
        )}
    </div>
)}
                        
            {/* Step 5 */}

            {step === 5 && (
                <div className="space-y-6">
                    <h3 className="text-xl font-semibold mb-4 border-b pb-2">Employment & Finances</h3>
                    
                    <FormField
                      control={form.control} name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>What is your main employment status?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="EMPLOYED">Employed</SelectItem>
                              <SelectItem value="SELF_EMPLOYED">Self-Employed / ИП</SelectItem>
                              <SelectItem value="STUDENT">Student</SelectItem>
                              <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                              <SelectItem value="STUDENT_EMPLOYED">Student & Employed</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ========================================================== */}
                    {/* Условный блок для РАБОТАЮЩИХ */}
                    {/* ========================================================== */}
                    {(form.watch('employmentType') === 'EMPLOYED' || form.watch('employmentType') === 'STUDENT_EMPLOYED') && (
                        <div className="p-4 border rounded-md space-y-4 animate-in fade-in-50">
                            <h4 className="font-semibold text-lg">Employer Details</h4>
                            <FormField control={form.control} name="employerDetails.name" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="e.g., Global IT Solutions" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="employerDetails.address" render={({ field }) => (<FormItem><FormLabel>Company Address</FormLabel><FormControl><Input placeholder="e.g., 42 Mustaqillik Square" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="employerDetails.townCity" render={({ field }) => (<FormItem><FormLabel>Town / City</FormLabel><FormControl><Input placeholder="e.g., Tashkent" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="employerDetails.country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input placeholder="e.g., Uzbekistan" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="space-y-2">
                                <FormLabel>Company Phone</FormLabel>
                                <div className="flex gap-2">
                                    <FormField control={form.control} name="employerDetails.phoneCode" render={({ field }) => (<FormItem className="w-[80px]"><FormControl><Input placeholder="+998" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="employerDetails.phoneNumber" render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder="712001122" {...field} /></FormControl></FormItem>)} />
                                </div>
                                <FormMessage>{form.formState.errors.employerDetails?.phoneCode?.message || form.formState.errors.employerDetails?.phoneNumber?.message}</FormMessage>
                            </div>
                            <div className="space-y-2">
                                <FormLabel>Start Date of Work</FormLabel>
                                <div className="flex gap-2">
                                    <FormField control={form.control} name="employerDetails.startDate.month" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} maxLength={2} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="employerDetails.startDate.year" render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} maxLength={4} /></FormControl></FormItem>)} />
                                </div>
                                <FormMessage>{form.formState.errors.employerDetails?.startDate?.root?.message}</FormMessage>
                            </div>
                            <FormField control={form.control} name="employerDetails.jobTitle" render={({ field }) => (<FormItem><FormLabel>Your Job Title</FormLabel><FormControl><Input placeholder="e.g., Junior Frontend Developer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="employerDetails.annualSalary" render={({ field }) => (<FormItem><FormLabel>Your Annual Salary (in UZS)</FormLabel><FormControl><Input placeholder="e.g., 150000000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="employerDetails.jobDescription" render={({ field }) => (<FormItem><FormLabel>Describe your job</FormLabel><FormControl><Input placeholder="e.g., Developing and maintaining web applications" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    )}
                    
                    {/* ========================================================== */}
                    {/* Условный блок для ИП */}
                    {/* ========================================================== */}
                    {form.watch('employmentType') === 'SELF_EMPLOYED' && (
                        <div className="p-4 border rounded-md space-y-4 animate-in fade-in-50">
                            <h4 className="font-semibold text-lg">Self-Employment Details</h4>
                            <FormField control={form.control} name="selfEmployedDetails.jobTitle" render={({ field }) => (<FormItem><FormLabel>What do you do?</FormLabel><FormControl><Input placeholder="e.g., Freelance Designer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="selfEmployedDetails.annualIncome" render={({ field }) => (<FormItem><FormLabel>Your Annual Income (in UZS)</FormLabel><FormControl><Input placeholder="e.g., 200000000" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    )}

                    {/* ========================================================== */}
                    {/* Общие финансовые вопросы */}
                    {/* ========================================================== */}
                    <div className="pt-6 mt-6 border-t">
                        <h4 className="font-semibold text-lg mb-4">Your Finances</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField 
                          control={form.control} 
                          name="moneyInBankAmountUSD" 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Total savings for this trip (in USD)</FormLabel> {/* <-- ИЗМЕНЕНО */}
                              <FormControl><Input placeholder="e.g., 5000" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                        )}/>
                            <FormField control={form.control} name="moneySpendMonth" render={({ field }) => (<FormItem><FormLabel>Your average monthly spending (in UZS), Include living costs, money given to dependants, rent or mortgage, and any other bills or costs.</FormLabel><FormControl><Input placeholder="e.g., 5000000" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        </div>
                    </div>
                </div>
            )}

{step === 6 && (
//     <div className="space-y-6">
//         <h3 className="text-xl font-semibold mb-4 border-b pb-2">UK Travel History</h3>
        
//         <FormField
//           control={form.control} name="ukTravelHistory.hasVisited"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="text-lg">Have you visited the UK in the past 10 years?</FormLabel>
//               <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={String(field.value)}>
//                 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
//                 <SelectContent>
//                   <SelectItem value="true">Yes</SelectItem>
//                   <SelectItem value="false">No</SelectItem>
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />

//         {form.watch('ukTravelHistory.hasVisited') && (
//             <div className="space-y-4">
//                 {visitFields.map((field, index) => (
//                     <div key={field.id} className="p-4 border rounded-md relative animate-in fade-in-50">
//                         <h4 className="font-semibold mb-4">Visit {index + 1}</h4>
//                         <Button type="button" variant="ghost" size="sm" onClick={() => removeVisit(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50">Remove</Button>
//                         {/* Здесь будут FormField для reason, arrivalMonth, arrivalYear, durationInDays */}
//                     </div>
//                 ))}
//                 {visitFields.length < 3 && (
//                   <Button 
//                   type="button" 
//                   variant="outline" 
//                   onClick={() => appendVisit({ 
//                       // ПЕРЕДАЕМ ПОЛНЫЙ ОБЪЕКТ
//                       reason: 'TOURISM', 
//                       arrivalMonth: '', 
//                       arrivalYear: '', 
//                       durationInDays: '',
//                       // ДОБАВЛЯЕМ НЕДОСТАЮЩИЕ, НО ОБЯЗАТЕЛЬНЫЕ ПОЛЯ ИЗ СХЕМЫ
//                       // (даже если они пока не используются в JSX)
//                       // hadPreviousVisa: false, 
//                       // previousVisaIssueDate: { month: '', year: '' } 
//                   })}
//                 >
//                     + Add a Visit
//                 </Button>
//                 )}
//             </div>
//         )}
//     </div>
// )}

<div className="space-y-6">
<h3 className="text-xl font-semibold mb-4 border-b pb-2">UK Travel History</h3>

<FormField
  control={form.control} name="ukTravelHistory.hasVisited"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-lg">Have you visited the UK in the past 10 years?</FormLabel>
      <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={String(field.value)}>
        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
        <SelectContent>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

{form.watch('ukTravelHistory.hasVisited') && (
    <div className="space-y-4">
        {visitFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-md relative animate-in fade-in-50">
                <h4 className="font-semibold mb-4">Visit {index + 1}</h4>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeVisit(index)} className="absolute top-2 right-2 text-red-500 hover:bg-red-50">Remove</Button>
                
                {/* ДОБАВЛЕНЫ ПОЛЯ ФОРМЫ */}
                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name={`ukTravelHistory.previousVisits.${index}.reason`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reason for visit</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select reason"/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="TOURISM">Tourism</SelectItem>
                                        <SelectItem value="BUSINESS">Business</SelectItem>
                                        <SelectItem value="STUDY">Study</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <FormLabel>Date of Arrival</FormLabel>
                            <div className="flex gap-2">
                                <FormField control={form.control} name={`ukTravelHistory.previousVisits.${index}.arrivalMonth`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} maxLength={2} /></FormControl></FormItem>)} />
                                <FormField control={form.control} name={`ukTravelHistory.previousVisits.${index}.arrivalYear`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} maxLength={4} /></FormControl></FormItem>)} />
                            </div>
                        </div>
                        
                        <FormField
                            control={form.control}
                            name={`ukTravelHistory.previousVisits.${index}.durationInDays`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (days)</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 14" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </div>
        ))}
        {visitFields.length < 3 && (
            <Button type="button" variant="outline" onClick={() => appendVisit({ reason: 'TOURISM', arrivalMonth: '', arrivalYear: '', durationInDays: '' })}>
                + Add a Visit
            </Button>
        )}
    </div>
)}
</div>
)}
{step === 7 && (
    <div className="space-y-6">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Other Travel History</h3>
        <p className="text-sm text-gray-600">
            Please list your visits to Australia, Canada, New Zealand, USA, or the European Economic Area (including Switzerland) in the past 10 years.
            <br/>
            <b className="text-gray-700">The system will automatically use details of your 2 most recent trips for the application.</b>
        </p>

        <div className="space-y-4">
            {cwVisitFields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg relative animate-in fade-in-50 bg-slate-50">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg text-slate-800">Visit #{index + 1}</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeCwVisit(index)} className="text-red-500 hover:bg-red-50">Remove</Button>
                    </div>
                    
                    <div className="space-y-4">
                        <FormField
                          control={form.control} name={`commonwealthTravelHistory.${index}.country`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country / Region</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a country/region..."/></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="USA">USA</SelectItem>
                                  <SelectItem value="CANADA">Canada</SelectItem>
                                  <SelectItem value="AUSTRALIA">Australia</SelectItem>
                                  <SelectItem value="NEW_ZEALAND">New Zealand</SelectItem>
                                  <SelectItem value="EU_SWISS">European Economic Area / Switzerland</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch(`commonwealthTravelHistory.${index}.country`) === 'EU_SWISS' && (
                            <FormField 
                                control={form.control} 
                                name={`commonwealthTravelHistory.${index}.euCountryName`} 
                                render={({ field }) => (
                                    <FormItem className="animate-in fade-in-50">
                                        <FormLabel>Which country in the EEA?</FormLabel>
                                        <FormControl><Input placeholder="e.g., Germany" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                        )}

                        <FormField
                          control={form.control} name={`commonwealthTravelHistory.${index}.reason`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reason for visit</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select a reason..."/></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="TOURISM">Tourism</SelectItem>
                                  <SelectItem value="WORK">Work</SelectItem>
                                  <SelectItem value="STUDY">Study</SelectItem>
                                  <SelectItem value="TRANSIT">Transit</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                               <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <FormLabel>Date of arrival</FormLabel>
                                <div className="flex gap-2">
                                    <FormField control={form.control} name={`commonwealthTravelHistory.${index}.arrivalMonth`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="MM" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name={`commonwealthTravelHistory.${index}.arrivalYear`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="YYYY" {...field} /></FormControl></FormItem>)} />
                                </div>
                                <FormMessage>{form.formState.errors.commonwealthTravelHistory?.[index]?.arrivalMonth?.message || form.formState.errors.commonwealthTravelHistory?.[index]?.arrivalYear?.message}</FormMessage>
                            </div>
                            <FormField
                              control={form.control} name={`commonwealthTravelHistory.${index}.durationInDays`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration of stay (in days)</FormLabel>
                                  <FormControl><Input type="number" placeholder="e.g., 14" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                    </div>
                </div>
            ))}
            
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => appendCwVisit({ 
                    country: 'USA', 
                    reason: 'TOURISM', 
                    euCountryName: '', 
                    arrivalMonth: '', 
                    arrivalYear: '', 
                    durationInDays: '' 
                })}
            >
                + Add a Visit
            </Button>
        </div>

        <div className="pt-6 mt-6 border-t">
    <h3 className="text-lg font-semibold">Travel to Other Countries</h3>
    <p className="text-sm text-gray-600">
        List any other countries you have visited in the past 10 years (e.g., Turkey, UAE, Egypt).
        <br/>
        <b>Please provide details for up to 2 countries.</b>
    </p>

    <div className="space-y-4 mt-4">
        {worldVisitFields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg relative bg-slate-50 animate-in fade-in-50">
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-slate-800">Country #{index + 1}</h4>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeWorldVisit(index)} className="text-red-500 hover:bg-red-50">Remove</Button>
                </div>
                <div className="space-y-4">
                    <FormField 
                        control={form.control} 
                        name={`worldTravelHistory.${index}.country`} 
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Country Name</FormLabel>
                                <FormControl><Input placeholder="e.g., Turkey" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} 
                    />
                    
                    <FormField
                      control={form.control} name={`worldTravelHistory.${index}.reason`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for visit</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a reason..."/></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="TOURISM">Tourism</SelectItem>
                              <SelectItem value="BUSINESS">Work / Business</SelectItem>
                              <SelectItem value="STUDY">Study</SelectItem>
                              <SelectItem value="TRANSIT">Transit</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-2">
                        <FormLabel>Date of Arrival</FormLabel>
                        <div className="flex gap-2">
                            <FormField control={form.control} name={`worldTravelHistory.${index}.visitStartDate.day`} render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="DD" {...field} /></FormControl> </FormItem> )} />
                            <FormField control={form.control} name={`worldTravelHistory.${index}.visitStartDate.month`} render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="MM" {...field} /></FormControl> </FormItem> )} />
                            <FormField control={form.control} name={`worldTravelHistory.${index}.visitStartDate.year`} render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="YYYY" {...field} /></FormControl> </FormItem> )} />
                        </div>
                        <FormMessage>{form.formState.errors.worldTravelHistory?.[index]?.visitStartDate?.root?.message}</FormMessage>
                      </div>
                      <div className="space-y-2">
                        <FormLabel>Date of Departure</FormLabel>
                        <div className="flex gap-2">
                            <FormField control={form.control} name={`worldTravelHistory.${index}.visitEndDate.day`} render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="DD" {...field} /></FormControl> </FormItem> )} />
                            <FormField control={form.control} name={`worldTravelHistory.${index}.visitEndDate.month`} render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="MM" {...field} /></FormControl> </FormItem> )} />
                            <FormField control={form.control} name={`worldTravelHistory.${index}.visitEndDate.year`} render={({ field }) => ( <FormItem className="flex-1"> <FormControl><Input placeholder="YYYY" {...field} /></FormControl> </FormItem> )} />
                        </div>
                        <FormMessage>{form.formState.errors.worldTravelHistory?.[index]?.visitEndDate?.root?.message}</FormMessage>
                      </div>
                    </div>
                </div>
            </div>
        ))}
        
        {worldVisitFields.length < 2 && ( // <-- Ограничение на 2 поездки
            <Button 
                type="button" 
                variant="outline" 
                className="mt-4"
                onClick={() => appendWorldVisit({ 
                    country: '', 
                    reason: 'TOURISM', 
                    visitStartDate: {day:'',month:'',year:''}, 
                    visitEndDate: {day:'',month:'',year:''} 
                })}
            >
                + Add Another Country
            </Button>
        )}
    </div>
    
        </div>
    </div>
    
)}
            {step === 8 && <ReviewData />}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(s => Math.max(1, s - 1))} className={step === 1 ? 'invisible' : 'visible'}>
              Previous
            </Button>
            {step < totalSteps && (
              <Button type="button" onClick={handleNextStep}>Next</Button>
            )}
            {step === totalSteps && (
              <div className="flex flex-col items-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
                {submitError && <p className="text-sm text-red-600 mt-2">{submitError}</p>}
              </div>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}