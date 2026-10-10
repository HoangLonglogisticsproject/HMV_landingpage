import { Section } from '@/components/common/Section';
import { SectionTitle } from '@/components/common/SectionTitle';
import { Slider } from '@/components/common/Slider';
import { testimonials } from '@/data/site';

/** Một lời chứng thực kèm dấu ngoặc kép lớn (class .testimonial-quote). */
function Testimonial({ title, text, author }) {
  return (
    <figure className="testimonial-quote relative m-0 w-[80%] lg:w-[65%]">
      <h5 className="mb-[15px] text-[22.5px] font-medium">{title}</h5>
      <blockquote className="text-ink-muted m-0 mb-[35px] text-[17px]">{text}</blockquote>

      <figcaption className="grid grid-cols-[65px_1fr] gap-x-[20px] not-italic lg:ml-[30px]">
        <img
          src={author.photo}
          alt={author.name}
          className="row-span-2 w-[65px] rounded-full"
        />
        <h6 className="m-0 self-end text-[17px] font-medium">{author.name}</h6>
        <p className="text-[15px]">{author.location}</p>
      </figcaption>
    </figure>
  );
}

export function Testimonials() {
  return (
    <Section id="section--3">
      <SectionTitle
        description="Not sure yet?"
        title="Millions of Bankists are already making their lifes simpler."
        className="mb-[40px]"
      />

      <Slider items={testimonials} renderItem={item => <Testimonial {...item} />} />
    </Section>
  );
}
