# Manual progress backup

High Scores → Back up or restore progress → Download progress backup.
Save the JSON file in Files. To bring it to another browser/device, choose that
file in the same panel, review its date/counts, then choose Merge this backup.

Included: finished results, Championships, lifetime progress, timed Order/Hunt
records with their replays, and learning history. Excluded: active rounds, names
in device settings, voice settings and the import recovery journal. No account,
cloud service or automatic upload. A backup only protects what was saved when
the file was made; browser storage alone remains device/browser specific.

Existing record IDs win conflicts. New IDs are added once, history is combined,
and no current record is deleted. Current malformed data blocks an import rather
than being overwritten. Unsupported sections, negative/invalid values, duplicate
IDs and malformed replays are rejected before writing. The limit is 20 MB.

Close other quiz tabs before merging. A local write-ahead journal preserves the
prior bytes until the merge finishes. A failed write rolls back; if rollback is
also blocked, the next boot retries before allowing new progress writes. Do not
clear this site's storage while recovery is pending. Preview can be cancelled.

Automated checks cover idempotent merge, conflicting IDs, malformed files/current
data, failure at every write, crash recovery and phone preview/cancel/import.
The iPhone Files download/upload interaction still needs a physical-device check.
