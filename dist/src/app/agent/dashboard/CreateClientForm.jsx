"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClientForm = CreateClientForm;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const dialog_1 = require("@/components/ui/dialog");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
// Эта функция будет нашим Server Action
const actions_1 = require("./actions");
function CreateClientForm() {
    const [open, setOpen] = (0, react_1.useState)(false);
    const [fullName, setFullName] = (0, react_1.useState)('');
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)('');
    const handleSubmit = async () => {
        if (!fullName) {
            setError('Full name is required.');
            return;
        }
        setIsLoading(true);
        setError('');
        const result = await (0, actions_1.createClientAndApplication)(fullName);
        if (result.success) {
            // Успешно! Закрываем окно.
            // Перезагрузка страницы для обновления списка - самый простой способ для MVP
            window.location.reload();
            setOpen(false);
        }
        else {
            setError(result.message || 'Failed to create client.');
        }
        setIsLoading(false);
    };
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>
        <button_1.Button>+ New Application</button_1.Button>
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="sm:max-w-[425px]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Create New Application</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Enter the client's full name. An application with a unique access code will be generated.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label_1.Label htmlFor="name" className="text-right">
              Full Name
            </label_1.Label>
            <input_1.Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="col-span-3" placeholder="e.g., Aziz Aliev"/>
          </div>
          {error && <p className="col-span-4 text-sm text-red-600 text-center">{error}</p>}
        </div>
        <dialog_1.DialogFooter>
          <button_1.Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Code'}
          </button_1.Button>
        </dialog_1.DialogFooter>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
