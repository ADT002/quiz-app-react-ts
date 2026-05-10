import { describe, expect, it } from 'vitest';
import { blankQuestion } from './blankQuestion';

describe('blankQuestion', () => {
  it('single starts with 2 options, exactly 1 correct', () => {
    const q = blankQuestion('single');
    expect(q.type).toBe('single');
    expect(q.options).toHaveLength(2);
    expect(q.options!.filter((o) => o.is_correct)).toHaveLength(1);
  });

  it('multiple starts with 2 options, none correct', () => {
    const q = blankQuestion('multiple');
    expect(q.type).toBe('multiple');
    expect(q.options).toHaveLength(2);
    expect(q.options!.every((o) => !o.is_correct)).toBe(true);
  });

  it('fill_in_the_blank has 1 blank with empty correct_submission', () => {
    const q = blankQuestion('fill_in_the_blank');
    expect(q.fill_in_the_blanks).toHaveLength(1);
    expect(q.fill_in_the_blanks![0].correct_submission).toBe('');
  });

  it('order_question has 2 items with sequential orders', () => {
    const q = blankQuestion('order_question');
    expect(q.order_items).toHaveLength(2);
    expect(q.order_items!.map((i) => i.order)).toEqual([1, 2]);
  });

  it('match_choice_question links 1 item to 1 option via match_id', () => {
    const q = blankQuestion('match_choice_question');
    expect(q.match_items).toHaveLength(1);
    expect(q.match_options).toHaveLength(1);
    expect(q.match_options![0].match_id).toBe(q.match_items![0].id);
  });

  it('every type has stable IDs assigned', () => {
    const types = [
      'single',
      'multiple',
      'fill_in_the_blank',
      'order_question',
      'match_choice_question',
    ] as const;
    for (const t of types) {
      const q = blankQuestion(t);
      const allIds = [
        ...(q.options ?? []).map((o) => o.id),
        ...(q.fill_in_the_blanks ?? []).map((b) => b.id),
        ...(q.order_items ?? []).map((i) => i.id),
        ...(q.match_items ?? []).map((i) => i.id),
        ...(q.match_options ?? []).map((o) => o.id),
      ];
      expect(allIds.every((id) => typeof id === 'string' && id.length === 24)).toBe(
        true,
      );
    }
  });
});
