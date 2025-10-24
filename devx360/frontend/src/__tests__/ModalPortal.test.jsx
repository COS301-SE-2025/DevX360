import React from 'react';
import { render, screen } from '@testing-library/react';
import ModalPortal from '../components/Dashboard/modal/ModalPortal';

test('ModalPortal renders children when open', () => {
  render(
    <ModalPortal isOpen>
      <div>portal-content</div>
    </ModalPortal>
  );
  expect(screen.getByText('portal-content')).toBeInTheDocument();
});

test('ModalPortal returns null when closed', () => {
  const { container } = render(
    <ModalPortal isOpen={false}>
      <div>hidden</div>
    </ModalPortal>
  );
  expect(container).toBeEmptyDOMElement();
});


