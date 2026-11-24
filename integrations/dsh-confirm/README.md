# PPT Master confirmation for DSH Web

This optional extension adds a PPT Master sidebar to DeepSeek Harness Web.
Use it with the matching PPT Master skill on a Unix host. Start the skill's
usual two-stage confirmation and enter the confirmation code it prints.
The original confirmation page and server continue to own both stages,
template choices, validation, and project receipts.

The Python server opens a private Unix socket in the DSH home directory
when the extension is available. The extension serves the page and its
requests under the current DSH mount. The code selects one running
confirmation, and that address expires when its server stops. For a
locally hosted confirmation without the extension, use the usual loopback
address or the conversation confirmation workflow.
