# Foldify Documentation

This page contains user guides and instructions for using the Foldify platform.

## Dashboard

The dashboard consists of three main sections:

1. Protein Folding Tools Section
2. Computations Table Section
3. Example Sequences Section

### 1. Protein Folding Tools Section

This section consists of the cards with available Tools - AlphaFold 3, AlphaFold 2, ColabFold, OmegaFold and ESMFold.
By pressing the card with desired tool you will be redirected to the form page where you can configure the parameters including the protein sequence and run the prediction.

### 2. Computations Table Section

This section consists of a table listing both the last computed jobs and currently runnning jobs with their state.

For running jobs, you can see the status of your computation that can be `Queued`, `Running`, `Succeeded` or `Failed`.

For completed jobs, you can find your protein name and click the `View Result` button to display the result in the browser. You can also download the results by clicking the `Download` button.

![dashboard](/docs/dashboard.png)

### 3. Example Sequences Section

This section contains precomputed protein sequences that demostrate the use-cases of the Foldify platform. You can show details of each example by clicking the `View Details` button.

![examples](/docs/examples.png)

## Running a Computation

After choosing a tool, you will be redirected to the form page where you can fill in the parameters for the computation.

### Multifold Submission

If you want to predict the same protein strucutre with multiple tools for comparison purposes, you can use the `Multifold` feature. To do so, choose the `Multifold` card in the dashboard.
You will be redirected to the `Multifold Submission` form where you can enter the protein sequence (pure sequence, without FASTA header) and job name, and select the desired tools for computation. You can select any combination of the available tools: AlphaFold3, AlphaFold 2, ColabFold, OmegaFold and ESMFold.
After filling in the parameters, click the `Submit Job` button to start the computation. The jobs will be created for each selected tool and you will be notified via email when the computations are finished. Each job name will contain "MULTIFOLD-" prefix to indicate that it was submitted via the Multifold feature.

![multifoldform](/docs/multifold-form.png)

### AlphaFold 2, ColabFold, OmegaFold and ESMFold

The only required parameters are the **Protein Sequence** and the **Job Name**, everything else can be left
default. You can change the name of the job, but it must be unique (you cannot run multiple computations with the same name), otherwise you will be prompted
to enter a different name or check the `Force Computation` checkbox.

The form is similar for all four tools with minor differences in advanced options. The advanced options are hidden in expandable sections by default, but you can expand the desired section and change the parameters if needed. None of the advanced options are required, so you can leave them default if you are unsure about their meaning.

![form](/docs/af-form.png)

### AlphaFold 3

AlphaFold 3 is the latest version of the AlphaFold protein structure prediction model.
Foldify offers two different modes of submission for AlphaFold 3: `Basic Submission` and `JSON Submission`.

#### Basic Submission

Similar to other tools, the basic submission requires parameters such as **Protein Sequence** and the **Job Name**, but additionally the AlphaFold 3 requires **Model Seed(s)** and **ID(s)** for each molecule. The count of the IDs also determines the number of copies of each entity. Advanced options are hidden in the expandable sections and allow for example, the ability to specify custom ligands, atom bonds and upload CCD file.

![basicaf3form](/docs/alphafold3-form-basic.png)

#### JSON Submission

This mode is for users who want to submit a JSON file containing the protein sequence and other parameters. It is useful for advanced submissions, custom MSAs or resubmission of AlphaFold Server computations.

> **Warning**: You must ensure that the JSON file is **correctly formatted** and **contains all the required fields**. You can find more information about the JSON format in the [AlphaFold 3 input documentation](https://github.com/google-deepmind/alphafold3/blob/main/docs/input.md#top-level-structure). Recommended approach to ensure the correct JSON format is to run a small test computation with AlphaFold 3 tool in Foldify and then download the input JSON file, update the fields and their values and upload the modified JSON file for submission.

![jsonaf3form](/docs/alphafold3-form-json.png)

#### Faster Predictions with MMSeqs2

Foldify supports the use of MMSeqs2 for faster predictions. We use the scripts to add MMseqs2 **MSA/templates** to an AlphaFold 3 input JSON file. More about MMseqs2 can be found in the [MMseqs2 GitHub](https://github.com/hlasimpk/af3_mmseqs_scripts).

To use MMseqs2, you need to check the `Use Generated MSA` checkbox in the form - it is checked by default. If you want to specify **number of templates**, check the `Use Generated Templates` checkbox and specify the number of templates in the `Number of Templates` field that appears. The default value is **20**, but you can change it to custom value.

![mmseqs2](/docs/MMseqs2.png)

#### Submitting the Computation

If you want to share your results, you can do so by checking `Make results public via URL` checkbox. When the job is public, you can share the computation with link for 30 days. The publicity can be changed after the computation is finished in the `Results` page or straigth from the `My Jobs` table from `Visibility` column.

After filling in the parameters, you can start the computation by clicking the `Submit Job` button. When the computation finishes, you will receive an **email notification**. The state of the job can be monitored in the `Computations Table Section` on the dashboard. If you want to terminate a running job please contact us via e-mail [k8s@ics.muni.cz](mailto:k8s@ics.muni.cz).

## Viewing and Downloading Results

![jobstable](/docs/jobs-table.png)

### Multi-result Comparison

For the completed computations Foldify provides a multi-result comparison. To access it follow these steps:

1. Go to the `Jobs Table` on the dashboard.
2. Select the desired jobs by checking the checkboxes in the leftmost column of the table.
3. Click the `Compare Results` button that appears above the table.

You will be redirected to the `Multi-result Comparison` page, where you can see the selected results in one Mol\* Window accompanied with table that shows RMSD and TM-scores.

![multiresult](/docs/multiresult.png)

### Single Result View

If you want to preview the computed results, you can do so from the `Jobs Table` table on the dashboard. Find the protein name and click the `View Result` button to display the result in the browser.
You will be redirected to the `Single Result` page. Visualization is provided by [Mol\* Viewer](https://molstar.org/), which is a web-based molecular visualization tool. It allows you to view the protein structure in 3D and interact with it.

The `Results` page consists of three tabs:

1. **Graphical Output**: where you can see the 3D structure of the protein and other graphical data if available from the computation.
2. **Files**: where you can download input and output files of the computation separately or as a single archive. Input files include the protein sequence in FASTA format and for AlphaFold 3 also the input JSON file. Output files include predicted structure files in PDB format, MSA files, log files and other files generated during the computation.
3. **Technical Output**: where you can see the logs of the computation.

![singleresult](/docs/singleresult.png)

#### Plddt Score

Plddt score is also displayed in the `Results` page, which is a measure of the model confidence. The higher the score, the more confident the model is. Data is displayed for each model as graph. In case of OmegaFold and ESMFold and AlphaFold 3 the plddt data are not available.

![plddt](/docs/plddt.png)

## FAQ

### Why did my computation failed?

One way to find out how your computation failed is to view the logs and find an error warning there. To view the logs, go to the `Results` page and click on the `Technical Output` tab. Here you can see the logs of the computation. If you find an error message, you can try to fix it and run the computation again. If you are not sure what the error message means, you can contact us for help via [k8s@ics.muni.cz](mailto:k8s@ics.muni.cz).
