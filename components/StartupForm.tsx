"use client";

import Form from "next/form";
import { Input } from "./ui/input";
import { useActionState, useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import { formSchema } from "@/lib/validation";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createPitch } from "@/lib/actions";
import { CldUploadButton } from "next-cloudinary";

const StartupForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pitch, setPitch] = useState("");
  const [resource, setResource] = useState<any>(undefined);
  const [images, setImages] = useState<string[]>([]);

  const skipImageDeletion = useRef(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const deleteImages = async () => {
      if (!skipImageDeletion.current && images.length > 0) {
        try {
          await fetch(`/api/deleteImages`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ public_ids: images }),
          });
        } catch (error) {
          console.error("Error deleting images:", error);
        }
      }
    };

    const handleBeforeUnload = () => {
      deleteImages();
    };

    // Add event listener for page refresh or unload
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      deleteImages();
    };
  }, [images]);

  const handleFormSubmit = async (prevState: any, formData: FormData) => {
    try {
      const formValues = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        link: formData.get("link") as string,
        pitch,
      };

      await formSchema.parseAsync(formValues);

      const result = await createPitch(prevState, formData, pitch);

      if (result.status == "SUCCESS") {
        toast({
          title: "Success",
          description: "Your startup pitch as been created successfully",
        });

        skipImageDeletion.current = true;

        setImages([]);

        router.push(`/startup/${result._id}`);
      }

      return result;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;

        setErrors(fieldErrors as unknown as Record<string, string>);

        toast({
          title: "Error",
          description: "Please check your inputs and try again",
          variant: "destructive",
        });

        return { ...prevState, error: "validation faild", status: "ERROR" };
      }

      toast({
        title: "Error",
        description: "An unexpected error has occured",
        variant: "destructive",
      });

      return {
        ...prevState,
        error: "An unexpected error has occured",
        status: "ERROR",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(handleFormSubmit, {
    error: "",
    status: "INITIAL",
  });

  return (
    <Form action={formAction} className="startup-form">
      <div>
        <label htmlFor="title" className="startup-form_label">
          Title
        </label>
        <Input
          id="title"
          name="title"
          className="startup-form_input"
          required
          placeholder="Startup Title"
        />
        {errors.title && <p className="startup-form_error">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="startup-form_label">
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          className="startup-form_textarea"
          required
          placeholder="Startup Description"
        />
        {errors.description && (
          <p className="startup-form_error">{errors.description}</p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="startup-form_label">
          Category
        </label>
        <Input
          id="category"
          name="category"
          className="startup-form_input"
          required
          placeholder="Startup Category (Tech, Health, Education...)"
        />
        {errors.category && (
          <p className="startup-form_error">{errors.category}</p>
        )}
      </div>

      <div>
        <label htmlFor="link" className="startup-form_label">
          Image URL
        </label>
        <Input
          id="link"
          name="link"
          value={resource?.url}
          className="startup-form_input"
          required
          placeholder="Startup Image URL"
        />
        {errors.link && <p className="startup-form_error">{errors.link}</p>}

        <CldUploadButton
          uploadPreset="Test-01"
          className="mt-2 ml-4 startup-card_btn"
          onSuccess={(result, widget) => {
            if (
              result?.info &&
              typeof result.info !== "string" &&
              "url" in result.info
            ) {
              setResource(result.info);
              setImages((prevImages) => [...prevImages, result.info.public_id]);
            } else {
              console.error("Upload failed or result is missing.");
            }
            widget.close();
          }}
          onError={(error) => {
            console.error("Upload Error:", error);
          }}
        >
          Upload Image
        </CldUploadButton>
      </div>

      <div data-color-mode="light">
        <label htmlFor="pitch" className="startup-form_label">
          Pitch
        </label>
        <MDEditor
          value={pitch}
          onChange={(value) => setPitch(value as string)}
          id="pitch"
          preview="edit"
          height={300}
          style={{ borderRadius: 20, overflow: "hidden" }}
          textareaProps={{
            placeholder:
              "Briefly describe your idea and what problem it solves.",
          }}
          previewOptions={{
            disallowedElements: ["style"],
          }}
        />

        {errors.pitch && <p className="startup-form_error">{errors.pitch}</p>}
      </div>

      <Button
        type="submit"
        className="startup-form_btn text-white"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Your Pitch"}
        <Send className="size-6 ml-2" />
      </Button>
    </Form>
  );
};

export default StartupForm;
