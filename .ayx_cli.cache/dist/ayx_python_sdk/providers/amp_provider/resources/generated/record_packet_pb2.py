# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: record_packet.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x13record_packet.proto\x12\x03sdk\"8\n\x06Record\x12 \n\x05types\x18\x01 \x03(\x0e\x32\x11.sdk.AMPFieldType\x12\x0c\n\x04\x64\x61ta\x18\x02 \x01(\x0c\"P\n\x0cRecordPacket\x12\x10\n\x08sequence\x18\x01 \x01(\x03\x12\x10\n\x08progress\x18\x02 \x01(\x02\x12\x1c\n\x07records\x18\x03 \x03(\x0b\x32\x0b.sdk.Record*\xbc\x02\n\x0c\x41MPFieldType\x12\x11\n\rUNINITIALIZED\x10\x00\x12\n\n\x06STRING\x10\x01\x12\x08\n\x04\x42LOB\x10\x02\x12\x0e\n\nSPATIALOBJ\x10\x03\x12\x07\n\x03\x42\x43\x44\x10\x04\x12\x08\n\x04\x42OOL\x10\x05\x12\x08\n\x04INT0\x10\x06\x12\t\n\x05UINT8\x10\x07\x12\t\n\x05INT16\x10\x08\x12\t\n\x05INT32\x10\t\x12\t\n\x05INT64\x10\n\x12\t\n\x05\x46LOAT\x10\x0b\x12\n\n\x06\x44OUBLE\x10\x0c\x12\x08\n\x04\x44\x41TE\x10\r\x12\x0c\n\x08\x44\x41TETIME\x10\x0e\x12\x08\n\x04TIME\x10\x0f\x12\x12\n\x0eINDIRECTSTRING\x10\x11\x12\x10\n\x0cINDIRECTBLOB\x10\x12\x12\x13\n\x0fINDIRECTSPATIAL\x10\x13\x12\r\n\tBOOLFALSE\x10\x14\x12\x0c\n\x08\x42OOLTRUE\x10\x15\x12\x0f\n\x0b\x45MPTYSTRING\x10\x64\x12\x08\n\x04NULL\x10\x65\x62\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'record_packet_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _AMPFIELDTYPE._serialized_start=169
  _AMPFIELDTYPE._serialized_end=485
  _RECORD._serialized_start=28
  _RECORD._serialized_end=84
  _RECORDPACKET._serialized_start=86
  _RECORDPACKET._serialized_end=166
# @@protoc_insertion_point(module_scope)
