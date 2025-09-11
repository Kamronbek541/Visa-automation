import { useFormContext } from 'react-hook-form';

// Вспомогательный компонент для отображения одной строки данных
const DataRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col sm:flex-row py-2 border-b">
    <p className="w-full sm:w-1/3 font-semibold text-gray-600">{label}</p>
    <p className="w-full sm:w-2/3 text-gray-800">{String(value) || '-'}</p>
  </div>
);

export const ReviewData = () => {
  // Получаем доступ ко всем данным формы
  const { getValues } = useFormContext();
  const values = getValues();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4 border-b pb-2">Review Your Application</h3>
      <p className="text-gray-600 mb-4">Please carefully review all the information you have provided before submitting.</p>
      
      <div className="space-y-2">
        <DataRow label="First Name" value={values.givenNameFirst} />
        <DataRow label="Last Name" value={values.familyNameFirst} />
        <DataRow label="Phone Number" value={values.telephoneNumber} />
        <DataRow label="Gender" value={values.sex === 'M' ? 'Male' : values.sex === 'F' ? 'Female' : 'Unspecified'} />
        <DataRow 
          label="Date of Birth" 
          value={`${values.dateOfBirth.day}/${values.dateOfBirth.month}/${values.dateOfBirth.year}`} 
        />
        {/* Сюда мы будем добавлять другие поля по мере их создания */}
      </div>
    </div>
  );
};