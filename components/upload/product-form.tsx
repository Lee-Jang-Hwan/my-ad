"use client";

import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { UploadFormValues } from "@/lib/validation";

interface ProductFormProps {
  form: UseFormReturn<UploadFormValues>;
}

export function ProductForm({ form }: ProductFormProps) {
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="productName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>상품명</FormLabel>
            <FormControl>
              <Input
                placeholder="예: 프리미엄 핸드백"
                {...field}
                maxLength={200}
              />
            </FormControl>
            <FormDescription>
              상품명을 입력해주세요 (1-200자)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}
