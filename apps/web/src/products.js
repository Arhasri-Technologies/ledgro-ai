const businessNames = {rice: 'Rice industry workspace', ecommerce: 'Ecommerce workspace', dairy: 'Dairy business workspace'};
const businessModules = {rice: ['Inventory', 'Purchases'], ecommerce: ['Catalog', 'Orders'], dairy: ['Collection', 'Distribution']};
const businessFlows = {rice: ['Receive stock', 'Organize inventory', 'Plan the next purchase'], ecommerce: ['Organize your catalog', 'Manage incoming orders', 'Prepare for fulfillment'], dairy: ['Record collection', 'Organize daily supply', 'Plan distribution']};
const businessButtons = [...document.querySelectorAll('[data-business]')];
for (const button of businessButtons) {
  button.addEventListener('click', () => {
    for (const option of businessButtons) option.setAttribute('aria-pressed', String(option === button));
    document.querySelector('#business-caption').textContent = businessNames[button.dataset.business];
    const modules = businessModules[button.dataset.business];
    document.querySelector('#module-one').textContent = modules[0];
    document.querySelector('#module-two').textContent = modules[1];
    ['start', 'middle', 'end'].forEach((step, index) => {
      document.querySelector(`#business-flow-${step}`).textContent = businessFlows[button.dataset.business][index];
    });
  });
}
const stages = [
  ['DESCRIBE', 'Your requirements start the work.', 'Speak or type what you need. Choose your application targets and connect a new or existing project. Workspace permissions define which capabilities are available.'],
  ['PLAN & APPROVE', 'Specialists propose. You stay in control.', 'The orchestrator coordinates architecture, UX, data, and engineering agents. Review the proposed approach and give required approvals before scoped execution.'],
  ['BUILD', 'Approved plans become coordinated work.', 'Agents follow task dependencies, with Cursor execution and GitHub branches, commits, and pull requests. Approved local work runs through scoped VEL Electron permissions.'],
  ['VALIDATE', 'Generated code must earn its next step.', 'Builds, tests, security checks, and visual QA produce evidence for review. Failed quality gates send work back for correction before it can progress.'],
  ['RELEASE & EVOLVE', 'A release starts the next chapter.', 'Review the preview and approve release where required. Operate and improve the software with durable project context, retained decisions, and validation evidence.'],
];
const stageOutputs = ['A clear project brief', 'A plan for your approval', 'Changes ready for review', 'Quality evidence to inspect', 'A release with retained context'];
const stageButtons = [...document.querySelectorAll('[data-vel-stage]')];
for (const button of stageButtons) {
  button.addEventListener('click', () => {
    for (const option of stageButtons) option.setAttribute('aria-pressed', String(option === button));
    const index = Number(button.dataset.velStage);
    const [label, title, copy] = stages[index];
    document.querySelector('#vel-detail-label').textContent = `${String(index + 1).padStart(2, '0')} / ${label}`;
    document.querySelector('#vel-detail-title').textContent = title;
    document.querySelector('#vel-detail-copy').textContent = copy;
    document.querySelector('#vel-detail-output').textContent = stageOutputs[index];
  });
}
