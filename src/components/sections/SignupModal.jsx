import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Highlight } from '@/components/common/Highlight';
import { useModal } from '@/context/ModalContext';

const fields = [
  { id: 'first-name', label: 'First Name', type: 'text', autoComplete: 'given-name' },
  { id: 'last-name', label: 'Last Name', type: 'text', autoComplete: 'family-name' },
  { id: 'email', label: 'Email Address', type: 'email', autoComplete: 'email' },
];

/**
 * Modal mở tài khoản — dựng trên shadcn Dialog nên đã có sẵn overlay,
 * đóng bằng phím Escape, click ra ngoài và bẫy focus.
 */
export function SignupModal() {
  const { isOpen, setIsOpen, closeModal } = useModal();

  const handleSubmit = e => {
    e.preventDefault();
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-surface max-w-[600px] rounded-none border-none px-[30px] py-[40px] shadow-[0_40px_60px_rgba(0,0,0,0.3)] sm:max-w-[600px] lg:px-[60px] lg:py-[50px]">
        <DialogHeader>
          <DialogTitle className="mb-[25px] text-[28px] leading-[1.5] font-medium lg:mb-[45px] lg:text-[32px]">
            Open your bank account <br />
            in just <Highlight>5 minutes</Highlight>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Điền thông tin để mở tài khoản Bankist.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="grid items-center gap-[25px] lg:mx-[30px] lg:grid-cols-[1fr_2fr]"
        >
          {fields.map(field => (
            <FormField key={field.id} field={field} />
          ))}

          <Button type="submit" variant="brand" size="pill" className="justify-self-center lg:col-span-2">
            Next step &rarr;
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Cặp label + input dùng lại cho mọi field của form. */
function FormField({ field }) {
  return (
    <>
      <Label htmlFor={field.id} className="text-[17px] font-medium">
        {field.label}
      </Label>
      <Input
        id={field.id}
        type={field.type}
        autoComplete={field.autoComplete}
        className="h-auto rounded-[5px] border-border bg-white px-[15px] py-[10px] text-[17px] md:text-[17px]"
      />
    </>
  );
}
