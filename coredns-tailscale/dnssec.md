# Notes about implementing DNSSEC

(mostly generated via copilot...)
# DNSSEC is a protocol for securing DNS. It requires a number of DNS Records. The most important of these are the DNSKEY and DS records. The DNSKEY record is a public key that is used to sign the other records. The DS record is a digest of the DNSKEY record that is used to verify the DNSKEY record. The DS record is published in the parent zone. The DNSKEY record is published in the child zone.

RRSIG records are used to sign other records. The RRSIG record contains a signature of the record it is signing. The signature is created using the private key that corresponds to the DNSKEY record. The RRSIG record also contains the DNSKEY record that was used to create the signature. The DNSKEY record is used to verify the signature.

CDNSKEY Records are used to indicate that the zone is signed. The CDNSKEY record is a digest of the DNSKEY record. The CDNSKEY record is used to verify the DNSKEY record.

CDS Records are used to indicate that the zone is signed. The CDS record is a digest of the DS record. The CDS record is used to verify the DS record.

DS records are published in the parent zone. DNSKEY records are published in the child zone.

DNSKEY records are published in the child zone. RRSIG records are published in the child zone.

# DANE is a protocol for securing DNS. It requires a number of DNS Records. The most important of these are the TLSA records. The TLSA record is a digest of the public key that is used to secure the connection. The TLSA record is published in the child zone.

# DNSSEC in CoreDNS

RRSIG
CDNSKEY
CDS
DS
DNSKEY
TLSA
