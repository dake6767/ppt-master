# PPT Master confirmation for DSH Web

This optional extension opens PPT Master confirmation links from DeepSeek
Harness Web. Use it with the matching PPT Master skill on a Unix host.
Start two-stage confirmation and click the link the skill shares in chat.
The original confirmation page and server continue to own both stages,
template choices, validation, and project receipts.

The Python server opens a private Unix socket in the DSH home directory
when the extension is available. The extension serves the page and its
requests under the current DSH mount. The code selects one running
confirmation, and that address expires when its server stops. For a
locally hosted confirmation without the extension, use the usual loopback
address or the conversation confirmation workflow.
