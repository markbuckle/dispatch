'use client';

import type { Domain } from '@dispatch/db';
import { primaryButton, smallButton } from '../button-styles';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../dialog';
import { DnsRecords } from './dns-records';

type DnsRecordsButtonProps = Pick<Domain, 'name' | 'dkimTokens' | 'dkimHostedZone'>;

export function DnsRecordsButton({ name, dkimTokens, dkimHostedZone }: DnsRecordsButtonProps) {
  return (
    <Dialog>
      <DialogTrigger className={smallButton}>DNS records</DialogTrigger>
      <DialogContent size="wide">
        <DialogHeader>
          <DialogTitle>DNS records for {name}</DialogTitle>
          <DialogDescription>
            Add each one as a CNAME record. SES verifies this domain once it finds all 3.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <DnsRecords name={name} dkimTokens={dkimTokens} dkimHostedZone={dkimHostedZone} />
        </DialogBody>
        <DialogFooter>
          <DialogClose className={primaryButton}>Done</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
